const express = require("express");
const colors = require("colors");
const cors = require("cors");
const serverless = require("serverless-http");
const AWS = require("aws-sdk");
const bodyParser = require("body-parser");
const sgMail = require("@sendgrid/mail");
const sgClient = require("@sendgrid/client");
const axios = require("axios");

const func = require("./function");
const e = require("express");

require("dotenv").config();

const accountSid = process.env.TWILIOACCOUNTSID;
const authToken = process.env.TWILIOAUTHTOKEN;
// const client = require("twilio")(accountSid, authToken);

const ses = new AWS.SES({
  accessKeyId: process.env.AWSACCESSKEYID,
  secretAccessKey: process.env.AWSSECRETKEY,
  region: process.env.AWSREGION
});

const DynamoDB = new AWS.DynamoDB({
  region: process.env.AWSREGION,
  endpoint: process.env.AWSENDPOINT,
  accessKeyId: process.env.AWSACCESSKEYID,
  secretAccessKey: process.env.AWSSECRETKEY
});

const app = express();

app.disable("etag");
app.disable("x-powered-by");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

app.post("/saveinfo", async (req, res) => {
  const bodyReferrer = req.body.referrer
    ? req.body.referrer.replace(/ /gm, "+")
    : "";
  const bodyReferral = req.body.referral
    ? req.body.referral.replace(/ /gm, "+")
    : "";

  sgMail.setApiKey(process.env.SENDGRIDAPIKEY);

  try {
    if (func.decryptedValue(bodyReferral) !== "") {
      const referrerparam = {
        FilterExpression:
          "referrer = :subreferrer OR referrer = :referrer OR referral = :referrer",
        ExpressionAttributeValues: {
          ":subreferrer": {
            S: func.decryptedValue(bodyReferral).substring(0, 6)
          },
          ":referrer": {
            S: func.decryptedValue(bodyReferral)
          }
        },
        TableName: "referral"
      };

      let clientReward = JSON.stringify([]);
      let rewardReferralEmail = req.body.email;
      let referralCount = 0;
      let rewardReferralFirstName =
        req.body.name && req.body.name.split(" ").length > 0
          ? req.body.name.split(" ")[0]
          : "";
      let rewardReferralLastName =
        req.body.name && req.body.name.split(" ").length > 1
          ? req.body.name.split(" ")[1]
          : "";

      const referrerRes = await DynamoDB.scan(referrerparam).promise();
      if (referrerRes && referrerRes.Items) {
        for (let i = 0; i < referrerRes.Items.length; i++) {
          //campaign
          if (referrerRes.Items[i].referral.S == "") {
            clientReward = referrerRes.Items[i].reward
              ? referrerRes.Items[i].reward.S
              : JSON.stringify([]);

            if (func.decryptedValue(bodyReferral).length == 6) {
              let referrals = referrerRes.Items.filter(
                (sitem) => sitem.referral.S == func.decryptedValue(bodyReferrer)
              );
              referralCount = referrals.length;

              const msg = {
                to: [referrerRes.Items[i].email.S],
                from: process.env.SENDGRIDFROM,
                subject: "Upgrade referral",
                text: `${req.body.email} signed up using your referral link`
              };

              await sgMail.send(msg);
            }
          }

          //referral
          if (
            func.decryptedValue(bodyReferral).length == 12 &&
            referrerRes.Items[i].referrer.S == func.decryptedValue(bodyReferral)
          ) {
            rewardReferralEmail = referrerRes.Items[i].email.S;
            rewardReferralFirstName =
              referrerRes.Items[i].name.S &&
              referrerRes.Items[i].name.S.split(" ").length > 0
                ? referrerRes.Items[i].name.S.split(" ")[0]
                : "";
            rewardReferralLastName =
              referrerRes.Items[i].name.S &&
              referrerRes.Items[i].name.S.split(" ").length > 1
                ? referrerRes.Items[i].name.S.split(" ")[1]
                : "";

            let referrals = referrerRes.Items.filter(
              (sitem) => sitem.referrer.S == ""
            );
            referralCount = referrals.length + 1;

            const msg = {
              to: [referrerRes.Items[i].email.S],
              from: process.env.SENDGRIDFROM,
              subject: "Upgrade referral",
              text: `${req.body.email} signed up using your referral link`
            };

            await sgMail.send(msg);
          }
        }

        if (JSON.parse(clientReward).length > 0 && rewardReferralEmail) {
          const arr = JSON.parse(clientReward).filter(
            (item) => parseInt(item.subreferrals) == referralCount
          );
          if (arr.length > 0) {
            const msg = {
              to: [rewardReferralEmail],
              from: process.env.SENDGRIDFROM,
              subject: arr[0].name ? arr[0].name : "Eben Promotion Code",
              text: arr[0].msg
                ? arr[0].msg
                : `Congratulations! Your Promo Code is ${arr[0].code}`
            };

            await sgMail.send(msg);

            if (arr[0].tagId) {
              //keap api
              const saveContactRes = await axios(
                "https://api.infusionsoft.com/crm/rest/v1/contacts",
                {
                  method: "put",
                  data: {
                    family_name: rewardReferralFirstName,
                    given_name: rewardReferralLastName,
                    email_addresses: [
                      { field: "EMAIL1", email: rewardReferralEmail }
                    ],
                    duplicate_option: "Email"
                  },
                  headers: {
                    "X-Keap-API-Key":
                      "KeapAK-48ebbf403e92ee56efa3638556560a10b5d53637d27fd09d46",
                    "Content-Type": "application/json"
                  }
                }
              );
              console.log("save contact", saveContactRes);
              if (saveContactRes.data && saveContactRes.data.id) {
                const applyTagRes = await axios(
                  `https://api.infusionsoft.com/crm/rest/v1/contacts/${saveContactRes.data.id}/tags`,
                  {
                    method: "post",
                    data: { tagIds: [arr[0].tagId] },
                    headers: {
                      "X-Keap-API-Key":
                        "KeapAK-48ebbf403e92ee56efa3638556560a10b5d53637d27fd09d46",
                      "Content-Type": "application/json"
                    }
                  }
                );
                console.log("apply tag", applyTagRes);
              }
            }
          }
        }
      }
    }

    const now = new Date();

    let param = {
      TableName: "referral",
      Item: {
        id: { S: req.body.id },
        email: { S: req.body.email },
        name: { S: req.body.name ? req.body.name : "" },
        phone: { S: req.body.phone ? req.body.phone : "" },
        referral: { S: func.decryptedValue(bodyReferral) },
        referrer: { S: func.decryptedValue(bodyReferrer) },
        hashedReferrer: { S: bodyReferrer.replace(/\//g, "crypt") },
        hashedReferral: { S: bodyReferral.replace(/\//g, "crypt") },
        date: {
          S: req.body.date
            ? req.body.date
            : ("0" + (now.getMonth() + 1)).substr(-2) +
              "/" +
              now.getDate() +
              "/" +
              now.getFullYear() +
              " " +
              ("0" + now.getHours()).substr(-2) +
              ":" +
              ("0" + now.getMinutes()).substr(-2) +
              "." +
              ("0" + now.getSeconds()).substr(-2)
        },
        opt: { S: "out" },
        campaignName: {
          S: req.body.campaignName ? req.body.campaignName : ""
        }
      }
    };

    if (req.body.webflow && func.decryptedValue(bodyReferral) !== "") {
      if (func.decryptedValue(bodyReferrer) !== "") {
        const msg = {
          to: [req.body.email],
          from: process.env.SENDGRIDFROM,
          subject: "Upgrade referral link",
          html: `Here is your <a target='_blank' href='https://www.upgrademe.ai/intro?referral=${bodyReferrer}'>referral link</a>. Share this with friends and earn rewards when they sign up.`
        };

        await sgMail.send(msg);
      }

      const parameter = {
        FilterExpression: "email = :email AND referral = :referral",
        ExpressionAttributeValues: {
          ":email": { S: req.body.email },
          ":referral": { S: func.decryptedValue(bodyReferral) }
        },
        TableName: "referral"
      };

      const existUsers = await DynamoDB.scan(parameter).promise();
      if (
        existUsers &&
        existUsers.Items &&
        existUsers.Items.length > 0 &&
        func.decryptedValue(bodyReferrer) !== ""
      ) {
        param.Item.id.S = existUsers.Items[0].id.S;
      }
    }

    DynamoDB.putItem(param, async (err) => {
      if (err) {
        console.log(err);
        res.send({ err });
      } else {
        let result = { success: true };
        result = {
          ...result,
          id: param.Item.id.S
        };
        if (bodyReferrer) {
          result = {
            ...result,
            hashedReferrer: bodyReferrer.replace(/\//g, "crypt"),
            referralLink: `https://ai.reinvent.co/referral/${bodyReferrer.replace(
              /\//g,
              "crypt"
            )}`
          };
        }
        let type = "";
        let printRes = {
          id: req.body.id,
          code: bodyReferral
        };

        if (bodyReferral && bodyReferrer) {
          type = "Save ambassador:";
        }
        if (bodyReferral && bodyReferrer == "") {
          type = "Save referral:";
        }
        if (bodyReferral == "" && bodyReferrer) {
          type = "Save campaign:";
        }
        console.log(type, printRes);
        res.status(200).send(result);
      }
    });
  } catch (err) {
    console.log(err);
    res.send({ err });
  }
});

app.post("/oneReferral", async (req, res) => {
  try {
    const param = {
      FilterExpression: "email = :email AND referral = :referral",
      ExpressionAttributeValues: {
        ":email": { S: req.body.email },
        ":referral": { S: req.body.referral }
      },
      TableName: "referral"
    };

    const referrals = await DynamoDB.scan(param).promise();

    res.send(referrals);
  } catch (err) {
    console.log(err);
    res.send({ err });
  }
});

app.post("/referrers", async (req, res) => {
  try {
    // const param = {
    //   FilterExpression: "email = :email",
    //   ExpressionAttributeValues: {
    //     ":email": { S: req.body.email }
    //   },
    //   TableName: "referral"
    // };

    const param = {
      FilterExpression: "referral = :referral",
      ExpressionAttributeValues: {
        ":referral": { S: "" }
      },
      TableName: "referral"
    };

    const clients = await DynamoDB.scan(param).promise();
    let arr = [];

    if (clients && clients.Items) {
      for (let i = 0; i < clients.Items.length; i++) {
        if (
          clients.Items[i].referrer &&
          clients.Items[i].referrer.S &&
          clients.Items[i].hashedReferrer &&
          clients.Items[i].hashedReferrer.S
        ) {
          const p = {
            FilterExpression: "begins_with (referral, :referral)",
            ExpressionAttributeValues: {
              ":referral": {
                S: clients.Items[i].referrer.S
              }
            },
            TableName: "referral"
          };
          const referral = await DynamoDB.scan(p).promise();
          let arr1 = [];
          let arr2 = [];

          for (let k = 0; k < referral.Items.length; k++) {
            if (
              referral.Items[k].referral &&
              referral.Items[k].referral.S &&
              referral.Items[k].referral.S.length == 6
            ) {
              // const ext = arr1.filter(
              //   (item) => item.email === referral.Items[k].email.S
              // );
              // if (ext.length === 0) {
              arr1.push({
                email: referral.Items[k].email.S
              });
              // }
            } else {
              // const ext = arr2.filter(
              //   (item) => item.email === referral.Items[k].email.S
              // );
              // if (ext.length === 0) {
              arr2.push({
                email: referral.Items[k].email.S
              });
              // }
            }
          }

          arr.push({
            id: clients.Items[i].id.S,
            url: clients.Items[i].hashedReferrer.S,
            campaignName: clients.Items[i].campaignName
              ? clients.Items[i].campaignName.S
              : "",
            count: arr1.length,
            count1: arr2.length,
            date: clients.Items[i].date.S,
            type:
              clients.Items[i].referrer.S.length === 6 &&
              clients.Items[i].email.S == req.body.email
                ? "creator"
                : "non-creator",
            tags:
              clients.Items[i].tags && clients.Items[i].tags.S
                ? JSON.parse(clients.Items[i].tags.S)
                : []
          });
        }
      }
    }
    res.send({ data: arr });
  } catch (err) {
    console.log(err);
    res.send({ err });
  }
});

app.post("/allSubReferralsByEmail", async (req, res) => {
  try {
    let campaigns = [];

    const param = {
      FilterExpression:
        "email = :email AND referral <> :referral AND referrer <> :referrer",
      ExpressionAttributeValues: {
        ":email": { S: req.body.email },
        ":referral": { S: "" },
        ":referrer": { S: "" }
      },
      TableName: "referral"
    };

    const referrals = await DynamoDB.scan(param).promise();
    let arr = [];

    if (referrals && referrals.Items) {
      for (let i = 0; i < referrals.Items.length; i++) {
        if (referrals.Items[i].referrer && referrals.Items[i].referrer.S) {
          const campaignsItems = await DynamoDB.scan({
            FilterExpression: "referrer = :referrer",
            ExpressionAttributeValues: {
              ":referrer": { S: referrals.Items[i].referral.S }
            },
            TableName: "referral"
          }).promise();

          campaigns = campaigns.concat(campaignsItems.Items);

          const p = {
            FilterExpression: "referral = :referral",
            ExpressionAttributeValues: {
              ":referral": {
                S: referrals.Items[i].referrer.S
              }
            },
            TableName: "referral"
          };
          const subreferrals = await DynamoDB.scan(p).promise();
          if (subreferrals && subreferrals.Items) {
            for (let k = 0; k < subreferrals.Items.length; k++) {
              arr.push({
                id: subreferrals.Items[k].id.S,
                email: subreferrals.Items[k].email.S,
                referral: subreferrals.Items[k].referral.S,
                name: subreferrals.Items[k].name.S,
                date: subreferrals.Items[k].date.S
              });
            }
          }
        }
      }
    }
    res.send({ data: arr, campaigns });
  } catch (err) {
    console.log(err);
    res.send({ err });
  }
});

app.post("/referrals", async (req, res) => {
  try {
    let gmailCounter = "0";
    const clients = await DynamoDB.scan({
      FilterExpression: "referrer = :referral",
      ExpressionAttributeValues: {
        ":referral": {
          S: func.decryptedValue(req.body.code.replace(/(crypt)/gm, "/"))
        }
      },
      TableName: "referral"
    }).promise();
    if (clients && clients.Items && clients.Items.length > 0) {
      gmailCounter = clients.Items[0].gmailCounter
        ? clients.Items[0].gmailCounter.S
        : "0";
    }

    let referralArr = [];

    const p = {
      FilterExpression: "begins_with (referral, :referral)",
      ExpressionAttributeValues: {
        ":referral": {
          S: func.decryptedValue(req.body.code.replace(/(crypt)/gm, "/"))
        }
      },
      TableName: "referral"
    };
    const referral = await DynamoDB.scan(p).promise();
    if (referral && referral.Items && referral.Items.length > 0) {
      for (let n = 0; n < referral.Items.length; n++) {
        let obj = {
          id: referral.Items[n].id.S,
          email: referral.Items[n].email.S,
          name: referral.Items[n].name.S,
          phone: referral.Items[n].phone.S,
          date: referral.Items[n].date.S,
          hashedReferral: referral.Items[n].hashedReferral
            ? referral.Items[n].hashedReferral.S
            : "",
          hashedReferrer: referral.Items[n].hashedReferrer
            ? referral.Items[n].hashedReferrer.S
            : "",
          type:
            referral.Items[n].referral.S.length == 6
              ? "Referral"
              : "Sub-referral",
          gmailCounter: gmailCounter
        };

        let count = 0;
        const subreferrals = referral.Items.filter(
          (iitem) => iitem.referral.S == referral.Items[n].referrer.S
        );
        count = subreferrals.length;

        obj = {
          ...obj,
          count
        };

        referralArr.push(obj);
      }
    }

    res.send(referralArr);
  } catch (err) {
    console.log(err);
    res.send({ err });
  }
});

app.post("/untiedreferrals", async (req, res) => {
  try {
    let referralArr = [];

    const p = {
      FilterExpression: "referral = :referral AND referrer = :referrer",
      ExpressionAttributeValues: {
        ":referral": {
          S: "000000000000"
        },
        ":referrer": {
          S: ""
        }
      },
      TableName: "referral"
    };
    const referral = await DynamoDB.scan(p).promise();
    if (referral && referral.Items && referral.Items.length > 0) {
      for (let n = 0; n < referral.Items.length; n++) {
        let obj = {
          id: referral.Items[n].id.S,
          email: referral.Items[n].email.S,
          name: referral.Items[n].name.S,
          phone: referral.Items[n].phone.S,
          date: referral.Items[n].date.S,
          hashedReferral: referral.Items[n].hashedReferral
            ? referral.Items[n].hashedReferral.S
            : "",
          hashedReferrer: referral.Items[n].hashedReferrer
            ? referral.Items[n].hashedReferrer.S
            : ""
        };

        referralArr.push(obj);
      }
    }

    res.send(referralArr);
  } catch (err) {
    console.log(err);
    res.send({ err });
  }
});

app.post("/allReferrals", async (req, res) => {
  try {
    const param = {
      FilterExpression: "referral = :referral",
      ExpressionAttributeValues: {
        ":referral": { S: "" }
      },
      TableName: "referral"
    };

    const clients = await DynamoDB.scan(param).promise();
    let clientsArr = clients.Items;
    clientsArr.sort((a, b) => {
      let da = new Date(a.date.S.split(".")[0]).getTime();
      let db = new Date(b.date.S.split(".")[0]).getTime();

      return db - da;
    });

    let referralArr = [];

    for (let i = 0; i < clientsArr.length; i++) {
      let obj = {};

      const p = {
        FilterExpression: "begins_with (referral, :referral)",
        ExpressionAttributeValues: {
          ":referral": {
            S: clientsArr[i].referrer.S.substring(0, 6)
          }
        },
        TableName: "referral"
      };
      const referral = await DynamoDB.scan(p).promise();
      if (referral && referral.Items && referral.Items.length > 0) {
        for (let n = 0; n < referral.Items.length; n++) {
          obj = {
            ...obj,
            email: referral.Items[n].email.S,
            name: referral.Items[n].name.S,
            phone: referral.Items[n].phone.S,
            date: referral.Items[n].date.S,
            code: referral.Items[n].referral.S,
            campaignName: clientsArr[i].campaignName
              ? clientsArr[i].campaignName.S
              : "",
            referrer: referral.Items[n].referrer
              ? referral.Items[n].referrer.S
              : "",
            type:
              referral.Items[n].referral.S.length == 6
                ? "Referral"
                : "Sub-referral"
          };

          let count = 0;
          if (referral.Items[n].referral.S.length == 6) {
            let subreferrals = referral.Items.filter(
              (sitem) => sitem.referral.S == referral.Items[n].referrer.S
            );
            count = subreferrals.length;
          }

          obj = {
            ...obj,
            count: count
          };

          referralArr.push(obj);
        }
      }
    }

    res.send({ campaigns: clientsArr, referrals: referralArr });
  } catch (err) {
    console.log(err);
    res.send({ err });
  }
});

app.post("/updateReferral", async (req, res) => {
  try {
    const referral = await DynamoDB.getItem({
      Key: {
        id: { S: req.body.id }
      },
      TableName: "referral"
    }).promise();

    await DynamoDB.putItem({
      TableName: "referral",
      Item: {
        id: { S: referral.Item.id.S },
        email: { S: req.body.email },
        name: { S: req.body.name },
        businessName: {
          S: referral.Item.businessName ? referral.Item.businessName.S : ""
        },
        phone: { S: referral.Item.phone ? referral.Item.phone.S : "" },
        referral: {
          S: referral.Item.referral ? referral.Item.referral.S : ""
        },
        referrer: {
          S: referral.Item.referrer ? referral.Item.referrer.S : ""
        },
        hashedReferrer: {
          S: referral.Item.hashedReferrer ? referral.Item.hashedReferrer.S : ""
        },
        hashedReferral: {
          S: referral.Item.hashedReferral ? referral.Item.hashedReferral.S : ""
        },
        date: { S: referral.Item.date.S },
        message: {
          S: referral.Item.message ? referral.Item.message.S : ""
        },
        opt: {
          S: referral.Item.opt ? referral.Item.opt.S : ""
        },
        reward: {
          S: referral.Item.reward ? referral.Item.reward.S : JSON.stringify([])
        },
        gmailCounter: {
          S: referral.Item.gmailCounter ? referral.Item.gmailCounter.S : "0"
        }
      }
    }).promise();

    res.send({
      success: true
    });
  } catch (err) {
    console.log(err);
    res.send({ err });
  }
});

app.post("/oneClient", async (req, res) => {
  try {
    const clients = await DynamoDB.scan({
      FilterExpression: "email = :email AND referral = :referral",
      ExpressionAttributeValues: {
        ":email": {
          S: req.body.email
        },
        ":referral": {
          S: ""
        }
      },
      TableName: "referral"
    }).promise();

    res.send(clients);
  } catch (err) {
    console.log(err);
    res.send({ err });
  }
});

app.post("/oneClientById", async (req, res) => {
  try {
    const client = await DynamoDB.getItem({
      TableName: "referral",
      Key: {
        id: { S: req.body.id }
      }
    }).promise();

    res.send(client);
  } catch (err) {
    console.log(err);
    res.send({ err });
  }
});

app.post("/oneClientByHashedReferrer", async (req, res) => {
  try {
    const clients = await DynamoDB.scan({
      FilterExpression: "hashedReferrer = :hashedReferrer",
      ExpressionAttributeValues: {
        ":hashedReferrer": {
          S: req.body.hashedReferrer
        }
      },
      TableName: "referral"
    }).promise();

    const data = clients.Items.length > 0 ? clients.Items[0] : [];
    res.send({ Item: data });
  } catch (err) {
    console.log(err);
    res.send({ err });
  }
});

app.post("/oneClientByReferrer", async (req, res) => {
  try {
    const clients = await DynamoDB.scan({
      FilterExpression: "referrer = :referrer",
      ExpressionAttributeValues: {
        ":referrer": {
          S: req.body.referrer
        }
      },
      TableName: "referral"
    }).promise();

    const data = clients.Items.length > 0 ? clients.Items[0] : [];
    res.send({ Item: data });
  } catch (err) {
    console.log(err);
    res.send({ err });
  }
});

app.post("/updateClient", async (req, res) => {
  try {
    const clients = await DynamoDB.scan({
      FilterExpression: "email = :email AND referral = :referral",
      ExpressionAttributeValues: {
        ":email": {
          S: req.body.email
        },
        ":referral": {
          S: ""
        }
      },
      TableName: "referral"
    }).promise();

    if (clients && clients.Items && clients.Items.length > 0) {
      for (let k = 0; k < clients.Items.length; k++) {
        if (req.body.id && req.body.id !== clients.Items[k].id.S) continue;

        await DynamoDB.putItem({
          TableName: "referral",
          Item: {
            id: { S: clients.Items[k].id.S },
            email: { S: clients.Items[k].email.S },
            name: {
              S: req.body.name
                ? req.body.name
                : clients.Items[k].name
                ? clients.Items[k].name.S
                : ""
            },
            businessName: {
              S: req.body.businessName
                ? req.body.businessName
                : clients.Items[k].businessName
                ? clients.Items[k].businessName.S
                : ""
            },
            phone: {
              S: req.body.phone
                ? req.body.phone
                : clients.Items[k].phone
                ? clients.Items[k].phone.S
                : ""
            },
            campaignName: {
              S: req.body.campaignName
                ? req.body.campaignName
                : clients.Items[k].campaignName
                ? clients.Items[k].campaignName.S
                : ""
            },
            referral: {
              S: clients.Items[k].referral ? clients.Items[k].referral.S : ""
            },
            referrer: {
              S: clients.Items[k].referrer ? clients.Items[k].referrer.S : ""
            },
            hashedReferrer: {
              S: clients.Items[k].hashedReferrer
                ? clients.Items[k].hashedReferrer.S
                : ""
            },
            hashedReferral: {
              S: clients.Items[k].hashedReferral
                ? clients.Items[k].hashedReferral.S
                : ""
            },
            date: { S: clients.Items[k].date.S },
            message: {
              S: clients.Items[k].message ? clients.Items[k].message.S : ""
            },
            opt: {
              S: clients.Items[k].opt ? clients.Items[k].opt.S : ""
            },
            reward: {
              S: clients.Items[k].reward
                ? clients.Items[k].reward.S
                : JSON.stringify([])
            },
            gmailCounter: {
              S: clients.Items[k].gmailCounter
                ? clients.Items[k].gmailCounter.S
                : "0"
            },
            tags: {
              S: clients.Items[k].tags
                ? clients.Items[k].tags.S
                : JSON.stringify([])
            }
          }
        }).promise();
      }
      res.send({
        success: true
      });
    } else {
      res.send({
        err: { message: "Please create campaign first" }
      });
    }
  } catch (err) {
    console.log(err);
    res.send({ err });
  }
});

app.post("/updateClientGmailCounter", async (req, res) => {
  try {
    const clients = await DynamoDB.scan({
      FilterExpression: "referrer = :referrer",
      ExpressionAttributeValues: {
        ":referrer": {
          S: req.body.referrer
        }
      },
      TableName: "referral"
    }).promise();

    if (clients && clients.Items && clients.Items.length > 0) {
      for (let k = 0; k < clients.Items.length; k++) {
        await DynamoDB.putItem({
          TableName: "referral",
          Item: {
            id: { S: clients.Items[k].id.S },
            email: { S: clients.Items[k].email.S },
            name: { S: clients.Items[k].name ? clients.Items[k].name.S : "" },
            businessName: {
              S: clients.Items[k].businessName
                ? clients.Items[k].businessName.S
                : ""
            },
            phone: {
              S: clients.Items[k].phone ? clients.Items[k].phone.S : ""
            },
            referral: {
              S: clients.Items[k].referral ? clients.Items[k].referral.S : ""
            },
            referrer: {
              S: clients.Items[k].referrer ? clients.Items[k].referrer.S : ""
            },
            hashedReferrer: {
              S: clients.Items[k].hashedReferrer
                ? clients.Items[k].hashedReferrer.S
                : ""
            },
            hashedReferral: {
              S: clients.Items[k].hashedReferral
                ? clients.Items[k].hashedReferral.S
                : ""
            },
            date: { S: clients.Items[k].date.S },
            message: {
              S: clients.Items[k].message ? clients.Items[k].message.S : ""
            },
            opt: {
              S: clients.Items[k].opt ? clients.Items[k].opt.S : ""
            },
            reward: {
              S: clients.Items[k].reward
                ? clients.Items[k].reward.S
                : JSON.stringify([])
            },
            gmailCounter: {
              S:
                clients.Items[k].gmailCounter && clients.Items[k].gmailCounter.S
                  ? (parseInt(clients.Items[k].gmailCounter.S) + 1).toString()
                  : "1"
            },
            tags: {
              S: clients.Items[k].tags
                ? clients.Items[k].tags.S
                : JSON.stringify([])
            },
            campaignName: {
              S: clients.Items[k].campaignName
                ? clients.Items[k].campaignName.S
                : ""
            }
          }
        }).promise();
      }
      res.send({
        success: true
      });
    } else {
      res.send({
        err: { message: "Please create campaign first" }
      });
    }
  } catch (err) {
    console.log(err);
    res.send({ err });
  }
});

app.post("/sendmails", async (req, res) => {
  sgMail.setApiKey(process.env.SENDGRIDAPIKEY);
  let msg = {
    to: req.body.toAddresses,
    from: process.env.SENDGRIDFROM,
    subject: req.body.subject,
    html: req.body.content,
    replyTo: req.body.fromAddress
      ? req.body.fromAddress
      : process.env.SENDGRIDFROM
  };

  if (req.body.attachment && req.body.filename && req.body.type) {
    let attachmentContent = req.body.attachment;
    if (req.body.type == "application/pdf") {
      attachmentContent = await func.contentFromPdf(req.body.attachment);
    }
    if (attachmentContent) {
      msg = {
        ...msg,
        attachments: [
          {
            content: Buffer.from(attachmentContent).toString("base64"),
            filename: req.body.filename,
            type: req.body.type,
            disposition: "attachment"
          }
        ]
      };
    }
  }

  await sgMail
    .send(msg)
    .then(() => {
      res.send({ success: true });
    })
    .catch((err) => {
      console.log(err);
      res.send({ err });
    });
});

app.post("/sendmailstoambsandreferrals", async (req, res) => {
  sgMail.setApiKey(process.env.SENDGRIDAPIKEY);

  const addresses = req.body.toAddresses;

  for (let i = 0; i < addresses.length; i++) {
    let link = addresses[i].link;

    if (req.body.prelink == "share1") {
      link = link.replace(
        /(ambasadorurl)/gm,
        "https://www.upgrademe.ai/share1?inf_field_ReferralCode"
      );
    } else {
      link = link.replace(
        /(ambasadorurl)/gm,
        "https://www.upgrademe.ai/intro?referral"
      );
    }

    let content = req.body.content.replace(/(referral_link)/gm, link);

    let msg = {
      to: [addresses[i].address],
      from: process.env.SENDGRIDFROM,
      subject: req.body.subject,
      html: content,
      replyTo: process.env.SENDGRIDFROM
    };

    let list = [
      "dritis@gmail.com",
      "tedbrink29@gmail.com",
      "tgb29@itaccomplish.com",
      "michaelsilver003@gmail.com",
      "michaelsilver003@gmail.com",
      "plove95@gmail.com",
      "dev.noikeo@gmail.com",
      "briguylas75@gmail.com",
      "nathan.ej.johnston@gmail.com",
      "ljcastro9@gmail.com",
      "will.k@jjkplaces.com",
      "gigisshop48@gmail.com",
      "adantaemarcparis@gmail.com",
      "yelena.photographerofjoy@gmail.com",
      "kim@ebenpagan.com",
      "kimpercyvt@gmail.com",
      "james.theo222@gmail.com"
    ];

    if (list.includes(addresses[i].address) && ( i < addresses.length - 1) )  { 
      continue
    }
    else {
      if (!list.includes(addresses[i].address)) {
        const sendRes = await sgMail.send(msg);
        console.log(`Email sent to ${addresses[i].address}`, sendRes);
      }
      
      if (
        (addresses.length > 10 && i == 10) ||
        (addresses.length < 10 && i == addresses.length - 1)
      ) {
        console.log('I am in!', i)
        res.send({ success: true });
      }
    }
      
  }
});

// app.post("/sms", async (req, res) => {
//   let usernames = [];
//   let msgs = [];

//   const referrals = await DynamoDB.scan({
//     FilterExpression: "phone = :phone",
//     ExpressionAttributeValues: {
//       ":phone": {
//         S: req.body.From,
//       },
//     },
//     TableName: "referral",
//   }).promise();

//   if (referrals && referrals.Items && referrals.Items.length > 0) {
//     for (let i = 0; i < referrals.Items.length; i++) {
//       if (
//         referrals.Items[i].referral.S &&
//         referrals.Items[i].opt &&
//         referrals.Items[i].opt.S == "in"
//       ) {
//         if (req.body.Body.toLowerCase() == "no") {
//           const param = {
//             TableName: "referral",
//             Item: {
//               id: { S: referrals.Items[i].id.S },
//               email: { S: referrals.Items[i].email.S },
//               name: { S: referrals.Items[i].name.S },
//               businessName: { S: "" },
//               phone: { S: referrals.Items[i].phone.S },
//               referrer: { S: referrals.Items[i].referrer.S },
//               hashedReferrer: { S: referrals.Items[i].hashedReferrer.S },
//               date: { S: referrals.Items[i].date.S },
//               message: {
//                 S: "",
//               },
//               opt: { S: "out" },
//             },
//           };
//           await DynamoDB.putItem(param).promise();
//         }
//         if (req.body.Body.toLowerCase() == "yes") {
//           const clients = await DynamoDB.scan({
//             FilterExpression: "referrer = :referrer",
//             ExpressionAttributeValues: {
//               ":referrer": {
//                 S: referrals.Items[i].referral.S.substring(0, 6),
//               },
//             },
//             TableName: "referral",
//           }).promise();

//           if (clients && clients.Items && clients.Items.length > 0) {
//             for (let n = 0; n < clients.Items.length; n++) {
//               const sender = clients.Items[n].name
//                 ? clients.Items[n].name.S
//                 : clients.Items[n].businessName
//                 ? clients.Items[n].businessName.S
//                 : clients.Items[n].email.S;
//               usernames.push({
//                 sender: sender,
//                 phone: clients.Items[n].phone.S,
//               });
//               if (clients.Items[n].message)
//                 msgs.push({
//                   message: clients.Items[n].message.S,
//                   phone: clients.Items[n].phone.S,
//                 });
//             }
//           }
//         }
//       }
//     }
//   }

//   if (req.body.Body.toLowerCase() == "yes") {
//     for (let i = 0; i < usernames.length; i++) {
//       await client.messages.create({
//         body: `You are all set to receive text message updates from ${usernames[i].sender}. Reply STOP anytime to cancel`,
//         from: usernames[i].phone ? usernames[i].phone : process.env.PHONENUMBER,
//         to: req.body.From,
//       });
//     }

//     for (let i = 0; i < msgs.length; i++) {
//       await client.messages.create({
//         body: msgs[i].message,
//         from: msgs[i].phone ? msgs[i].phone : process.env.PHONENUMBER,
//         to: req.body.From,
//       });
//     }
//   }
// });

app.post("/saveMessage", async (req, res) => {
  try {
    const clientItem = await DynamoDB.getItem({
      TableName: "referral",
      Key: {
        id: { S: req.body.campaignid }
      }
    }).promise();

    if (clientItem.Item) {
      const phone = clientItem.Item.phone.S;
      const param = {
        TableName: "referral",
        Item: {
          id: { S: req.body.campaignid },
          email: { S: clientItem.Item.email.S },
          name: { S: clientItem.Item.name.S },
          businessName: {
            S: clientItem.Item.businessName
              ? clientItem.Item.businessName.S
              : ""
          },
          phone: { S: clientItem.Item.phone.S },
          referral: {
            S: clientItem.Item.referral ? clientItem.Item.referral.S : ""
          },
          referrer: { S: clientItem.Item.referrer.S },
          hashedReferral: {
            S: clientItem.Item.hashedReferral
              ? clientItem.Item.hashedReferral.S
              : ""
          },
          hashedReferrer: {
            S: clientItem.Item.hashedReferrer
              ? clientItem.Item.hashedReferrer.S
              : ""
          },
          date: { S: clientItem.Item.date.S },
          message: { S: req.body.message },
          opt: {
            S: clientItem.Item.opt ? clientItem.Item.opt.S : ""
          },
          reward: {
            S: clientItem.Item.reward
              ? clientItem.Item.reward.S
              : JSON.stringify([])
          },
          gmailCounter: {
            S: clientItem.Item.gmailCounter
              ? clientItem.Item.gmailCounter.S
              : "0"
          },
          tags: {
            S: clientItem.Item.tags
              ? clientItem.Item.tags.S
              : JSON.stringify([])
          }
        }
      };

      await DynamoDB.putItem(param).promise();
      // const p = {
      //   FilterExpression: "begins_with (referral, :referral)",
      //   ExpressionAttributeValues: {
      //     ":referral": {
      //       S: clientItem.Item.referrer.S,
      //     },
      //   },
      //   TableName: "referral",
      // };
      // const referrals = await DynamoDB.scan(p).promise();

      // let phoneArr = [];
      // if (referrals && referrals.Items && referrals.Items.length > 0) {
      //   for (let k = 0; k < referrals.Items.length; k++) {
      //     if (
      //       referrals.Items[k].phone &&
      //       referrals.Items[k].opt &&
      //       referrals.Items[k].referral.S.length > 4
      //     ) {
      //       phoneArr.push({
      //         number: referrals.Items[k].phone.S,
      //         opt: referrals.Items[k].opt.S,
      //       });
      //     }
      //   }
      // }
      // for (let k = 0; k < phoneArr.length; k++) {
      //   if (phoneArr[k].opt == "in") {
      //     await client.messages.create({
      //       body: req.body.message,
      //       from: phone ? phone : process.env.PHONENUMBER,
      //       to: phoneArr[k].number,
      //     });
      //   }
      // }
    }
    res.status(200).send({
      status: 200,
      success: true
    });
  } catch (err) {
    console.log(err);
    res.send({ err });
  }
});

app.post("/saveReward", async (req, res) => {
  try {
    const clientItem = await DynamoDB.getItem({
      TableName: "referral",
      Key: {
        id: { S: req.body.campaignid }
      }
    }).promise();

    if (clientItem.Item) {
      const param = {
        TableName: "referral",
        Item: {
          id: { S: req.body.campaignid },
          email: { S: clientItem.Item.email.S },
          name: { S: clientItem.Item.name.S },
          businessName: {
            S: clientItem.Item.businessName
              ? clientItem.Item.businessName.S
              : ""
          },
          phone: { S: clientItem.Item.phone.S },
          referral: {
            S: clientItem.Item.referral ? clientItem.Item.referral.S : ""
          },
          referrer: { S: clientItem.Item.referrer.S },
          hashedReferral: {
            S: clientItem.Item.hashedReferral.S
              ? clientItem.Item.hashedReferral.S
              : ""
          },
          hashedReferrer: { S: clientItem.Item.hashedReferrer.S },
          date: { S: clientItem.Item.date.S },
          message: {
            S: clientItem.Item.message ? clientItem.Item.message.S : ""
          },
          opt: {
            S: clientItem.Item.opt ? clientItem.Item.opt.S : ""
          },
          reward: { S: req.body.reward },
          gmailCounter: {
            S: clientItem.Item.gmailCounter
              ? clientItem.Item.gmailCounter.S
              : "0"
          },
          tags: {
            S: clientItem.Item.tags
              ? clientItem.Item.tags.S
              : JSON.stringify([])
          },
          campaignName: {
            S: clientItem.Item.campaignName
              ? clientItem.Item.campaignName.S
              : ""
          }
        }
      };

      await DynamoDB.putItem(param).promise();
    }

    res.status(200).send({
      status: 200,
      success: true
    });
  } catch (err) {
    console.log(err);
    res.send({ err });
  }
});

app.post("/saveTags", async (req, res) => {
  try {
    const clientItem = await DynamoDB.getItem({
      TableName: "referral",
      Key: {
        id: { S: req.body.campaignid }
      }
    }).promise();

    if (clientItem.Item) {
      const param = {
        TableName: "referral",
        Item: {
          id: { S: req.body.campaignid },
          email: { S: clientItem.Item.email.S },
          name: { S: clientItem.Item.name.S },
          businessName: {
            S: clientItem.Item.businessName
              ? clientItem.Item.businessName.S
              : ""
          },
          phone: { S: clientItem.Item.phone.S },
          referral: {
            S: clientItem.Item.referral ? clientItem.Item.referral.S : ""
          },
          referrer: { S: clientItem.Item.referrer.S },
          hashedReferral: {
            S: clientItem.Item.hashedReferral.S
              ? clientItem.Item.hashedReferral.S
              : ""
          },
          hashedReferrer: { S: clientItem.Item.hashedReferrer.S },
          date: { S: clientItem.Item.date.S },
          message: {
            S: clientItem.Item.message ? clientItem.Item.message.S : ""
          },
          opt: {
            S: clientItem.Item.opt ? clientItem.Item.opt.S : ""
          },
          reward: {
            S: clientItem.Item.reward
              ? clientItem.Item.reward.S
              : JSON.stringify([])
          },
          gmailCounter: {
            S: clientItem.Item.gmailCounter
              ? clientItem.Item.gmailCounter.S
              : "0"
          },
          tags: {
            S: req.body.tags
          }
        }
      };

      await DynamoDB.putItem(param).promise();
    }

    res.status(200).send({
      status: 200,
      success: true
    });
  } catch (err) {
    console.log(err);
    res.send({ err });
  }
});

app.post("/saveTagsInKeap", async (req, res) => {
  try {
    axios("https://api.infusionsoft.com/crm/rest/v1/tags", {
      method: "post",
      data: req.body.data,
      headers: {
        "X-Keap-API-Key":
          "KeapAK-48ebbf403e92ee56efa3638556560a10b5d53637d27fd09d46",
        "Content-Type": "application/json"
      }
    })
      .then((response) => {
        res.send(response.data);
      })
      .catch((err) => {
        res.send(err);
      });
  } catch (err) {
    console.log(err);
    res.send({ err });
  }
});

app.post("/retrieveTagsInKeap", async (req, res) => {
  try {
    axios(
      `https://api.infusionsoft.com/crm/rest/v1/tags?category=123&name=${req.body.tagName}`,
      {
        method: "get",
        headers: {
          "X-Keap-API-Key":
            "KeapAK-48ebbf403e92ee56efa3638556560a10b5d53637d27fd09d46",
          "Content-Type": "application/json"
        }
      }
    )
      .then((response) => {
        res.send(response.data);
      })
      .catch((err) => {
        res.send(err);
      });
  } catch (err) {
    console.log(err);
    res.send({ err });
  }
});

app.post("/saveContactInKeap", async (req, res) => {
  try {
    axios("https://api.infusionsoft.com/crm/rest/v1/contacts", {
      method: "put",
      data: req.body.data,
      headers: {
        "X-Keap-API-Key":
          "KeapAK-48ebbf403e92ee56efa3638556560a10b5d53637d27fd09d46",
        "Content-Type": "application/json"
      }
    })
      .then((response) => {
        if (response.data.id) {
          axios(
            `https://api.infusionsoft.com/crm/rest/v1/contacts/${response.data.id}/tags`,
            {
              method: "post",
              data: req.body.tags,
              headers: {
                "X-Keap-API-Key":
                  "KeapAK-48ebbf403e92ee56efa3638556560a10b5d53637d27fd09d46",
                "Content-Type": "application/json"
              }
            }
          )
            .then((response1) => {
              res.send(response1.data);
            })
            .catch((err1) => {
              console.log(err1);
              res.send(err1);
            });
        } else {
          res.send(response.data);
        }
      })
      .catch((err) => {
        console.log(err);
        res.send(err);
      });
  } catch (err) {
    console.log(err);
    res.send({ err });
  }
});

app.post("/buyTwilioPhone", async (req, res) => {
  try {
    client.incomingPhoneNumbers
      .create({
        phoneNumber: req.body.phone,
        SmsUrl: `${process.env.APIURL}/sms`
      })
      .then((incoming_phone_number) =>
        res.send({ id: incoming_phone_number.sid })
      )
      .catch((err) => {
        console.log(err);
        res.send({ err });
      });
  } catch (err) {
    console.log(err);
    res.send({ err });
  }
});

app.post("/availableTwilioPhone", async (req, res) => {
  try {
    client
      .availablePhoneNumbers("US")
      .local.list()
      .then((available_phone_number) =>
        res.send({ numbers: available_phone_number })
      )
      .catch((err) => {
        console.log(err);
        res.send({ err });
      });
  } catch (err) {
    console.log(err);
    res.send({ err });
  }
});

app.post("/deleteClient", async (req, res) => {
  try {
    await DynamoDB.deleteItem({
      TableName: "referral",
      Key: {
        id: { S: req.body.id }
      }
    }).promise();

    res.send({ success: true });
  } catch (err) {
    console.log(err);
    res.send({ err });
  }
});

app.post("/getPrompts", async (req, res) => {
  try {
    let param = {
      TableName: "referralPrompt",
      FilterExpression: "email = :email AND contains(id, :type)"
    };
    if (req.body.type == "v1") {
      param = {
        ...param,
        ExpressionAttributeValues: {
          ":email": { S: req.body.email },
          ":type": { S: "promptV1" }
        }
      };
    } else {
      param = {
        ...param,
        ExpressionAttributeValues: {
          ":email": { S: req.body.email },
          ":type": { S: "promptV2" }
        }
      };
    }

    const clients = await DynamoDB.scan(param).promise();
    let arr = [];

    if (clients && clients.Items) {
      for (let i = 0; i < clients.Items.length; i++) {
        arr.push({
          id: clients.Items[i].id.S,
          name: clients.Items[i].name.S,
          description: clients.Items[i].description
            ? clients.Items[i].description.S
            : "",
          instructions: clients.Items[i].instructions
            ? clients.Items[i].instructions.S
            : "",
          prompt: clients.Items[i].prompt.S,
          systemMsg: clients.Items[i].systemMsg.S,
          questions: clients.Items[i].questions.S,
          demoAnswers: clients.Items[i].demoAnswers.S,
          advanced: clients.Items[i].advanced
            ? clients.Items[i].advanced.S
            : "false",
          basicQA: clients.Items[i].basicQA.S,
          basicSections: clients.Items[i].basicSections.S,
          clientAnalysis: clients.Items[i].clientAnalysis
            ? clients.Items[i].clientAnalysis.S
            : "",
          report: clients.Items[i].report ? clients.Items[i].report.S : "",
          promptType:
            clients.Items[i].promptType && clients.Items[i].promptType.S
              ? clients.Items[i].promptType.S
              : "raw"
        });
      }
    }
    res.send({ data: arr });
  } catch (err) {
    console.log(err);
    res.send({ err });
  }
});

app.post("/getPromptById", async (req, res) => {
  try {
    const prompt = await DynamoDB.getItem({
      TableName: "referralPrompt",
      Key: {
        id: { S: req.body.id }
      }
    }).promise();

    res.send(prompt);
  } catch (err) {
    console.log(err);
    res.send({ err });
  }
});

app.post("/savePrompt", async (req, res) => {
  try {
    const prompt = await DynamoDB.getItem({
      TableName: "referralPrompt",
      Key: {
        id: { S: req.body.id }
      }
    }).promise();

    const promptItem = {
      id: { S: req.body.id },
      name: { S: req.body.name },
      description: {
        S: req.body.description
          ? req.body.description
          : prompt && prompt.Item && prompt.Item.description
          ? prompt.Item.description.S
          : ""
      },
      email: { S: req.body.email },
      systemMsg: { S: req.body.systemMsg },
      prompt: { S: req.body.prompt },
      questions: { S: req.body.questions },
      demoAnswers: { S: req.body.demoAnswers },
      clientAnalysis: {
        S: req.body.clientAnalysis
          ? req.body.clientAnalysis
          : prompt && prompt.Item && prompt.Item.clientAnalysis
          ? prompt.Item.clientAnalysis.S
          : ""
      },
      advanced: { S: req.body.advanced.toString() },
      basicQA: { S: req.body.basicQA },
      basicSections: {
        S: req.body.basicSections
          ? req.body.basicSections
          : prompt && prompt.Item && prompt.Item.basicSections
          ? prompt.Item.basicSections.S
          : "[]"
      },
      report: {
        S: req.body.report
          ? req.body.report
          : prompt && prompt.Item && prompt.Item.report
          ? prompt.Item.report.S
          : ""
      },
      promptType: {
        S: req.body.promptType
          ? req.body.promptType
          : prompt && prompt.Item && prompt.Item.promptType
          ? prompt.Item.promptType.S
          : ""
      }
    };

    const param = {
      TableName: "referralPrompt",
      Item: promptItem
    };

    await DynamoDB.putItem(param).promise();

    res.status(200).send({
      status: 200,
      success: true,
      prompt: {
        id: promptItem.id.S,
        name: promptItem.name.S,
        description: promptItem.description.S,
        email: promptItem.email.S,
        systemMsg: promptItem.systemMsg.S,
        prompt: promptItem.prompt.S,
        questions: promptItem.questions.S,
        demoAnswers: promptItem.demoAnswers.S,
        advanced: promptItem.advanced.S,
        basicQA: promptItem.basicQA.S,
        basicSections: promptItem.basicSections.S,
        report: promptItem.report.S,
        clientAnalysis: promptItem.clientAnalysis.S,
        promptType: promptItem.promptType.S
      }
    });
  } catch (err) {
    console.log(err);
    res.send({ err });
  }
});

app.post("/deletePrompt", async (req, res) => {
  try {
    await DynamoDB.deleteItem({
      TableName: "referralPrompt",
      Key: {
        id: { S: req.body.id }
      }
    }).promise();

    res.send({ success: true });
  } catch (err) {
    console.log(err);
    res.send({ err });
  }
});

app.post("/duplicatePrompt", async (req, res) => {
  try {
    const prompt = await DynamoDB.getItem({
      TableName: "referralPrompt",
      Key: {
        id: { S: req.body.id }
      }
    }).promise();

    const promptItem = {
      id: { S: func.randomStringRef(6) + "promptV2" },
      name: { S: prompt.Item.name ? prompt.Item.name.S : "" },
      description: {
        S: prompt.Item.description ? prompt.Item.description.S : ""
      },
      email: { S: prompt.Item.email ? prompt.Item.email.S : "" },
      systemMsg: { S: prompt.Item.systemMsg ? prompt.Item.systemMsg.S : "" },
      prompt: { S: prompt.Item.prompt ? prompt.Item.prompt.S : "" },
      questions: { S: prompt.Item.questions ? prompt.Item.questions.S : "" },
      demoAnswers: {
        S: prompt.Item.demoAnswers ? prompt.Item.demoAnswers.S : ""
      },
      advanced: { S: prompt.Item.advanced ? prompt.Item.advanced.S : "" },
      basicQA: { S: prompt.Item.basicQA ? prompt.Item.basicQA.S : "" },
      basicSections: {
        S: prompt.Item.basicSections ? prompt.Item.basicSections.S : ""
      },
      promptType: {
        S: prompt.Item.promptType ? prompt.Item.promptType.S : ""
      }
    };

    const param = {
      TableName: "referralPrompt",
      Item: promptItem
    };

    await DynamoDB.putItem(param).promise();

    res.send({ success: true });
  } catch (err) {
    console.log(err);
    res.send({ err });
  }
});

app.post("/getChatContentByEmail", async (req, res) => {
  try {
    const data = await DynamoDB.getItem({
      TableName: "referralChat",
      Key: {
        email: { S: req.body.email }
      }
    }).promise();

    res.status(200).send(data);
  } catch (err) {
    console.log(err);
    res.send({ err });
  }
});

app.post("/getChatContentByPrompt", async (req, res) => {
  try {
    const param = {
      FilterExpression: "contains(chat, :promptID)",
      ExpressionAttributeValues: {
        ":promptID": { S: `"${req.body.promptId}"` }
      },
      TableName: "referralChat"
    };

    const data = await DynamoDB.scan(param).promise();

    let arr = [];

    if (data && data.Items) {
      for (let i = 0; i < data.Items.length; i++) {
        const chatData = JSON.parse(data.Items[i].chat.S).find(
          (item) => item.prompt == req.body.promptId
        );
        arr.push({
          email: data.Items[i].email.S,
          chat: chatData
        });
      }
    }
    res.send(arr);
  } catch (err) {
    console.log(err);
    res.send({ err });
  }
});

app.post("/saveChatContent", async (req, res) => {
  try {
    const userItem = await DynamoDB.getItem({
      TableName: "referralChat",
      Key: {
        email: { S: req.body.email }
      }
    }).promise();

    let chatObj = [];

    if (userItem.Item && userItem.Item.chat.S) {
      chatObj = JSON.parse(userItem.Item.chat.S);

      let promptChat = chatObj.find((item) => item.prompt == req.body.prompt);
      if (promptChat) {
        const index = chatObj.findIndex(
          (item) => item.prompt == req.body.prompt
        );
        let prevChat = promptChat.data.concat(req.body.data);
        let ansArr = promptChat.answers;

        let prevAnswers = promptChat.answers.find(
          (item) => JSON.stringify(item) == JSON.stringify(req.body.answers)
        );

        if (!prevAnswers) {
          ansArr.push(req.body.answers);
        }

        chatObj[index] = {
          prompt: req.body.prompt,
          answers: ansArr,
          data: prevChat
        };
      } else {
        chatObj.push({
          prompt: req.body.prompt,
          answers: [req.body.answers],
          data: [req.body.data]
        });
      }
    } else {
      chatObj.push({
        prompt: req.body.prompt,
        answers: [req.body.answers],
        data: [req.body.data]
      });
    }

    const param = {
      TableName: "referralChat",
      Item: {
        email: { S: req.body.email },
        chat: { S: JSON.stringify(chatObj) }
      }
    };

    await DynamoDB.putItem(param).promise();

    res.status(200).send({
      status: 200,
      success: true
    });
  } catch (err) {
    console.log(err);
    res.send({ err });
  }
});

app.get("/", async (req, res) => {
  const code = req.query.code ? req.query.code : "";
  const state = req.query.state ? req.query.state.replace(/(@@)/gm, "=") : "";
  const stateObj = req.query.state
    ? JSON.parse(func.decryptedValue1(state.replace(/ /gm, "+")))
    : {};

  const id = stateObj.id ? stateObj.id : "";
  const param = stateObj.param ? stateObj.param : "contacts";
  const options = stateObj.options ? JSON.parse(stateObj.options) : {};
  const contacts = stateObj.contacts ? JSON.parse(stateObj.contacts) : {};
  const token = stateObj.token ? JSON.parse(stateObj.token) : {};
  const webflow = stateObj.webflow ? stateObj.webflow : false;
  let redirecturl = stateObj.redirecturl ? stateObj.redirecturl : "";

  let item = null;

  if (id) {
    item = await DynamoDB.getItem({
      TableName: "referral",
      Key: {
        id: { S: id }
      }
    }).promise();
  }

  if (id && item && item.Item && item.Item.hashedReferrer) {
    redirecturl += `/${item.Item.hashedReferrer.S}`;
  }

  let parameter = "";

  func
    .gmailContacts(
      code,
      req.protocol + "://" + req.get("host") + "/",
      param,
      options,
      token
    )
    .then((result) => {
      let resObj = { param, token: result.token };
      if (id && item && item.Item && item.Item.email) {
        resObj = { ...resObj, id, email: item.Item.email.S };
      }
      if (param == "contacts") {
        resObj = { ...resObj, contacts: result.contacts, options: options };
      }
      if (param == "send") {
        resObj = {
          ...resObj,
          contacts,
          messageId: result.messageId,
          options: options
        };
      }

      parameter = func.encryptedValue1(JSON.stringify(resObj));
      if (webflow) {
        redirecturl += `&state=${parameter}`;
      } else {
        redirecturl += `/?state=${parameter}`;
      }

      res.redirect(redirecturl);
    })
    .catch((error) => {
      console.log("err", error);

      let resObj = { param, token: {} };
      if (param == "contacts") {
        resObj = { ...resObj, error };
      }
      if (param == "send") {
        resObj = { ...resObj, error: JSON.stringify(error) };
      }

      if (id && item && item.Item && item.Item.email) {
        resObj = { ...resObj, id, email: item.Item.email.S };
      }

      parameter = func.encryptedValue(JSON.stringify(resObj));
      if (webflow) {
        redirecturl += `&state=${parameter}`;
      } else {
        redirecturl += `/?state=${parameter}`;
      }

      res.redirect(redirecturl);
    });
});

// app.get("/", (req, res) => {
//   res.send("Hello world!");
// });

app.post("/sendWEmails", async (req, res) => {
  sgMail.setApiKey(process.env.SENDGRIDAPIKEY);
  const msg = {
    to: req.body.toAddresses,
    from: req.body.fromAddress,
    subject: req.body.subject,
    text: req.body.content,
    replyTo: req.body.fromAddress,
    attachments: [
      {
        content: Buffer.from(req.body.attachment).toString("base64"),
        filename: req.body.filename,
        type: req.body.type,
        disposition: "attachment"
      }
    ]
  };

  await sgMail
    .send(msg)
    .then(() => {
      res.send({ success: true });
    })
    .catch((err) => {
      console.log(err);
      res.send({ err });
    });
});

app.post("/readSgEmails", async (req, res) => {
  sgClient.setApiKey(process.env.SENDGRIDAPIKEY);

  const queryParams = {
    query: `to_email="${req.body.email}"`,
    limit: 20
  };

  const request = {
    url: `/v3/messages`,
    method: "GET",
    qs: queryParams
  };

  sgClient
    .request(request)
    .then(([response, body]) => {
      res.send(response.body);
    })
    .catch((error) => {
      console.error(error);
      res.send(error);
    });
});

app.use((err, req, res, next) => {
  res.status(500).send({ error: "Server error" });
  console.log(err);
});

if (process.env.ENVIRONMENT == "production") {
  exports.handler = serverless(app);
} else {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`.yellow.bold);
  });
}

module.exports = app;
