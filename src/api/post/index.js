import { instance, instance1, keapinstance } from "../instance";

export const saveUserinfo = async (data) => {
  return await instance
    .post("/saveinfo", data)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};

export const referrers = async (data) => {
  return await instance
    .post("/referrers", data)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};

export const oneReferral = async (data) => {
  return await instance
    .post("/oneReferral", data)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};

export const referrals = async (data) => {
  return await instance
    .post("/referrals", data)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};

export const untiedreferrals = async (data) => {
  return await instance
    .post("/untiedreferrals", data)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};

export const allReferrals = async (data) => {
  return await instance
    .post("/allReferrals", data)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};

export const allSubReferralsByEmail = async (data) => {
  return await instance
    .post("/allSubReferralsByEmail", data)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};

export const oneClient = async (data) => {
  return await instance
    .post("/oneClient", data)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};

export const oneClientById = async (data) => {
  return await instance
    .post("/oneClientById", data)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};

export const oneClientByHashedReferrer = async (data) => {
  return await instance
    .post("/oneClientByHashedReferrer", data)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};

export const oneClientByReferrer = async (data) => {
  return await instance
    .post("/oneClientByReferrer", data)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};

export const updateClient = async (data) => {
  return await instance
    .post("/updateClient", data)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};

export const sendMails = async (data) => {
  return await instance
    .post("/sendmails", data)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};

export const sendMailstoAmbsandReferrals = async (data) => {
  return await instance
    .post("/sendmailstoambsandreferrals", data)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};

export const saveMessage = async (data) => {
  return await instance
    .post("/saveMessage", data)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};

export const saveReward = async (data) => {
  return await instance
    .post("/saveReward", data)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};

export const buyTwilioPhone = async (data) => {
  return await instance
    .post("/buyTwilioPhone", data)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};

export const availableTwilioPhone = async (data) => {
  return await instance
    .post("/availableTwilioPhone", data)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};

export const deleteClient = async (data) => {
  return await instance
    .post("/deleteClient", data)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};

export const getPrompts = async (data) => {
  return await instance
    .post("/getPrompts", data)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};

export const getPromptById = async (data) => {
  return await instance
    .post("/getPromptById", data)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};

export const savePrompt = async (data) => {
  return await instance
    .post("/savePrompt", data)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};

export const deletePrompt = async (data) => {
  return await instance
    .post("/deletePrompt", data)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};

export const duplicatePrompt = async (data) => {
  return await instance
    .post("/duplicatePrompt", data)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};

export const getChatCompletion = async (messages) => {
  return await instance1.post("/chat/completions", {
    model: "gpt-3.5-turbo",
    messages: messages
  });
};

export const getChatContentByEmail = async (data) => {
  return await instance
    .post("/getChatContentByEmail", data)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};

export const getChatContentByPrompt = async (data) => {
  return await instance
    .post("/getChatContentByPrompt", data)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};

export const saveChatContent = async (data) => {
  return await instance
    .post("/saveChatContent", data)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};

export const updateReferral = async (data) => {
  return await instance
    .post("/updateReferral", data)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};

export const saveTags = async (data) => {
  return await instance
    .post("/saveTags", data)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};

export const saveTagInKeap = async (data) => {
  return await instance
    .post("/saveTagsInKeap", data)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};

export const retrieveTagsInKeap = async (data) => {
  return await instance
    .post("/retrieveTagsInKeap", data)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};

export const listMessages = async (data) => {
  return await instance
    .post("/readSgEmails", data)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};
