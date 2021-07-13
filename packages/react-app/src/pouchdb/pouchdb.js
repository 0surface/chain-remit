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
  };
  return remit;
}

async function save(remit) {
  return await db.put(remit);
}

async function get(id) {
  return await db.get(id);
}

async function fetchAll() {
  try {
    return await db.allDocs({ include_docs: true });
  } catch (ex) {
    console.error("fetchData error: ", ex);
  }
}

async function fetchBySender(_sender) {
  try {
    const docs = await db.allDocs({ include_docs: true });
    return docs.rows.map(d => d.doc).filter(d => d.sender === _sender);

    // console.log("fetchBySender::_sender:", _sender);
    // const docs = await db.allDocs({ include_docs: true });
    // console.log("fetchBySender::docs", docs);
    // console.log("fetchBySender::docs.rows", docs.rows);
    // const x = docs.rows.map(d => d.doc);
    // console.log("fetchBySender::docs.rows.map:", x);

    // const y = x.filter(d => d.sender === _sender);
    // console.log("fetchBySender::docs.rows.map.filter:", y);
    // return y;
  } catch (ex) {
    console.error("fetchData error: ", ex);
  }
}

async function fetchByRemiiter(_remitter) {
  try {
    const docs = await db.allDocs({ include_docs: true });
    return docs.rows.filter(d => d.doc.remitter === _remitter);
  } catch (ex) {
    console.error("fetchData error: ", ex);
  }
}
export default {
  init,
  setRemit,
  save,
  get,
  fetchAll,
  fetchBySender,
  fetchByRemiiter,
};
