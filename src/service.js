const CryptoJS = require("crypto-js");
const { jsPDF } = require("jspdf");

export const randomStringRef = (len) => {
  var p = "0123456789";

  return [...Array(len)].reduce((a) => a + p[~~(Math.random() * p.length)], "");
};

export function ValidateEmail(email) {
  var validRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

  if (email.match(validRegex)) {
    return true;
  } else {
    return false;
  }
}

export function isPhoneValid(phonenumber) {
  let regex = new RegExp("^[+]{1}(?:[0-9-()/.]s?){6, 15}[0-9]{1}$");
  alert(regex.test(phonenumber.toString()));
  return regex.test(phonenumber) == true;
}

export function encrypt(str) {
  return str;
}

export function decrypt(str) {
  return str;
}

export function encrypt1(str) {
  return CryptoJS.AES.encrypt(
    str,
    process.env.REACT_APP_SECRET_KEY ? process.env.REACT_APP_SECRET_KEY : ""
  ).toString();
}

export function decrypt1(str) {
  if (!str) return "";
  return CryptoJS.AES.decrypt(
    str,
    process.env.REACT_APP_SECRET_KEY ? process.env.REACT_APP_SECRET_KEY : ""
  ).toString(CryptoJS.enc.Utf8);
}

export function dateRange(begin, end) {
  let arr = [];
  const bTime = new Date(begin).getTime();
  const eTime = new Date(end).getTime();
  for (let index = bTime; index < eTime; index = index + 60 * 60 * 24 * 1000) {
    const updated = new Date(index);

    arr.push(
      ("0" + (updated.getMonth() + 1)).substr(-2) +
        "-" +
        updated.getDate() +
        "-" +
        updated.getFullYear()
    );
  }
  const endDate = new Date(end);
  const endItem =
    ("0" + (endDate.getMonth() + 1)).substr(-2) +
    "-" +
    endDate.getDate() +
    "-" +
    endDate.getFullYear();

  if (!arr.includes(endItem)) arr.push(endItem);

  return arr;
}

export function monthRange(end) {
  let arr = [];

  const eMonth = new Date(end).toLocaleString("default", { month: "short" });
  for (let i = 1; i <= 12; i++) {
    const date = new Date(`1900/${i}/01`);
    arr.push(new Date(date).toLocaleString("default", { month: "short" }));
    if (
      new Date(date).toLocaleString("default", { month: "short" }) == eMonth
    ) {
      break;
    }
  }

  return arr;
}

export function yearlyRange(begin, end) {
  let arr = [];
  const bYear = new Date(begin).getFullYear();
  const eYear = new Date(end).getFullYear();
  for (let index = bYear; index < eYear; index++) {
    arr.push(index);
  }

  if (!arr.includes(new Date(end).getFullYear()))
    arr.push(new Date(end).getFullYear());

  return arr;
}

export function generatePDF({ data, fileName }) {
  const pdf = new jsPDF({
    format: "a4",
    unit: "px"
  });
  pdf.html(data, {
    margin: [10, 10, 10, 10],
    async callback(pdf) {
      pdf.save(fileName);
    }
  });
}

export function base64FromPdf(data) {
  const pdf = new jsPDF();
  return new Promise((resolve) => {
    pdf.html(data, {
      async callback(pdf) {
        const reader = new FileReader();
        reader.readAsDataURL(pdf.output("blob"));
        resolve(
          new Promise((res) => {
            reader.onloadend = () => {
              res(reader.result);
            };
          })
        );
      }
    });
  });
}

export function basicQuestions() {
  return [
    {
      label: "purpose",
      question: "What is the purpose of the report?",
      answer: ""
    }
  ];
}

export function isJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}
