const PouchDB = require("pouchdb-browser");

const pouchDB = PouchDB.default.defaults();
let db;

function init() {
  db = new pouchDB("remit");
}

function setRemit(id, sender, remitter, password, lockDuration, amount, remitKey, deadline) {
  const remit = {
    _id: id,
    sender,
    remitter,
    password,
    lockDuration,
    amount,
    remitKey,
    deadline,
    settledTimestamp: 0,
    remitHasSettled: false,
  };
  return remit;
}

async function save(remit) {
  return await db.put(remit);
}

async function get(id) {
  return await db.get(id);
}

async function getByField(id, prop) {
  const item = await db.get(id);
  return item[`${prop}`];
}

async function update(id, prop, val) {
  const item = await db.get(`${id}`);
  item[`${prop}`] = val;
  return await db.put(item);
}

async function fetchAll() {
  try {
    return await db.allDocs({ include_docs: true });
  } catch (ex) {
    console.error("fetchData error: ", ex);
  }
}

async function fetchByAddress(_address) {
  try {
    const docs = await db.allDocs({ include_docs: true });
    console.log("docs:-", docs);
    //    return docs.rows.map(d => d.doc).filter(d => (d.sender === _address) | (d.remitter === _address));
    return docs.rows
      .map(d => d.doc)
      .filter(item => {
        return item.remitter === _address || item.sender === _address;
      });
  } catch (ex) {
    console.error("Pouchdb::fetchByAddress:error: ", ex);
  }
}

async function fetchBySender(_sender) {
  try {
    const docs = await db.allDocs({ include_docs: true });
    return docs.rows.map(d => d.doc).filter(d => d.sender === _sender);
  } catch (ex) {
    console.error("Pouchdb::fetchBySender:error: ", ex);
  }
}

async function fetchByRemiiter(_remitter) {
  try {
    const docs = await db.allDocs({ include_docs: true });
    return docs.rows.map(d => d.doc).filter(d => d.remitter === _remitter);
  } catch (ex) {
    console.error("Pouchdb::fetchByRemiiter:error: ", ex);
  }
}
export default {
  init,
  setRemit,
  save,
  get,
  getByField,
  update,
  fetchAll,
  fetchByAddress,
  fetchBySender,
  fetchByRemiiter,
};
