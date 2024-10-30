// App Constants
//export const API_URL_USER = "http://54.174.215.101";
//export const API_URL_ADMIN = "http://54.174.215.101/adminapi";
export const API_URL_USER = "http://localhost:3000";
export const API_URL_ADMIN = "http://localhost:3000/adminapi";

export var USER_ID = "";
export var JWT_TOKEN = "";

// App Constants End

export function setUSER_ID(id) {
  USER_ID = id;
}

export function setJWT_TOKEN(token) {
  JWT_TOKEN = token;
}

export function getData(item) {
  return localStorage.getItem(item);
}

export function storeData(item, val) {
  return localStorage.setItem(item, val);
}

export async function hget(url, params = undefined, isJson = true) {
  let paramsString = "";

  if (params) {
    paramsString = "?" + new URLSearchParams(params).toString();
  }

  let tempURL = API_URL_ADMIN + url + paramsString;
  return await new Promise((resolve, reject) => {
    fetch(tempURL)
      .then((res) => {
        if (res.status === 200) {
          if (isJson) {
            resolve(res.json());
          } else resolve(res.text());
          return;
        }
        let status = res.status;
        res
          .json()
          .then((res) => {
            reject({ res, status });
          })
          .catch((err) => reject({ err, status }));
      })
      .catch((err) => console.error(err));
  });
}

export async function uget(url, params = undefined, isJson = true) {
  let paramsString = "";

  if (params) {
    paramsString = "?" + new URLSearchParams(params).toString();
  }

  let tempURL = API_URL_USER + url + paramsString;
  return await new Promise((resolve, reject) => {
    fetch(tempURL)
      .then((res) => {
        if (res.status === 200) {
          if (isJson) {
            resolve(res.json());
          } else resolve(res.text());
          return;
        }
        let status = res.status;
        res
          .json()
          .then((res) => {
            reject({ res, status });
          })
          .catch((err) => reject({ err, status }));
      })
      .catch((err) => console.error(err));
  });
}

export function requestOptions(
  data = {},
  jwt = false,
  method = "POST",
  headers = {}
) {
  data = data || {};
  let ops = {
    method: method,
    headers: {
      ...headers,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    redirect: "follow",
  };

  if (jwt) {
    ops.headers["jwt"] = JWT_TOKEN;
    if (method !== "GET") data.userid = USER_ID;
  }
  if (method !== "GET") ops["body"] = JSON.stringify(data);
  return ops;
}

export async function hpost(...args) {
  const url = args.shift();

  return await new Promise((resolve, reject) => {
    fetch(API_URL_ADMIN + url, requestOptions(...args))
      .then((res) => {
        if (res.status === 200) {
          resolve(res.json());
          return;
        }
        let status = res.status;
        res
          .json()
          .then((res) => reject({ res, status }))
          .catch((err) => reject({ err, status }));
      })
      .catch((err) => reject(err));
  });
}

export async function upost(...args) {
  const url = args.shift();

  return await new Promise((resolve, reject) => {
    fetch(API_URL_USER + url, requestOptions(...args))
      .then((res) => {
        if (res.status === 200) {
          resolve(res.json());
          return;
        }
        let status = res.status;
        res
          .json()
          .then((res) => reject({ res, status }))
          .catch((err) => reject({ err, status }));
      })
      .catch((err) => reject(err));
  });
}

export function formatData(dataList, numCols) {
  const totalRows = Math.floor(dataList.length / numCols);
  let totalLastRow = dataList.length - totalRows * numCols;

  while (totalLastRow !== 0 && totalLastRow !== numCols) {
    dataList.push({ key: "blank", empty: true });
    totalLastRow++;
  }
  return dataList;
}

export function formatDate(inputDate) {
  const dateObj = new Date(inputDate);

  // Extract components
  const day = dateObj.getDate();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
  const year = dateObj.getFullYear();
  const ampm = dateObj.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const formattedDate = `${day}/${month}/${year} ${ampm}`;
  return formattedDate;
}

export function timeDifference(previous) {
  let current = +new Date();

  var msPerMinute = 60 * 1000;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var msPerMonth = msPerDay * 30;
  var msPerYear = msPerDay * 365;

  var elapsed = current - previous;

  if (elapsed < msPerMinute) {
    return Math.round(elapsed / 1000) + " seconds ago";
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + " minutes ago";
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + " hours ago";
  } else if (elapsed < msPerMonth) {
    return Math.round(elapsed / msPerDay) + " days ago";
  } else if (elapsed < msPerYear) {
    return Math.round(elapsed / msPerMonth) + " months ago";
  } else {
    return Math.round(elapsed / msPerYear) + " years ago";
  }
}

export function timeCountDown(previous) {
  let current = +new Date();

  const wtf = (previous - current) / 1000 / 60;
  if (wtf > -60 && wtf < 0) return "live";
  else if (wtf < -60) return "";

  const totalSeconds = Math.floor((previous - current) / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  const hours = totalHours - totalDays * 24;
  const minutes = totalMinutes - totalDays * 24 * 60 - hours * 60;
  const seconds =
    totalSeconds - totalDays * 24 * 60 * 60 - hours * 60 * 60 - minutes * 60;

  if ([totalDays, hours, minutes].every((val) => val === 0)) return "";

  let temp = "";
  if (totalDays) temp += totalDays + "D ";
  if (hours) temp += hours + "H ";
  if (minutes) temp += minutes + "M ";
  temp += seconds + "S";

  return temp;
}

export function nFormatter(num, digits) {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "B" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return num >= item.value;
    });
  return item
    ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol
    : "0";
}

export function validateName(name) {
  const nameRegex = /^[a-zA-Z ]{2,30}$/;
  return nameRegex.test(name);
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone) {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
}

export function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function genTxId() {
  let len = 16;

  var text = "";
  var charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  for (var i = 0; i < len; i++)
    text += charset.charAt(Math.floor(Math.random() * charset.length));

  return text;
}

export function handleNumericScroll(e) {
  e.target.blur();
  setTimeout(() => {
    e.target.focus();
  }, 0);
}

export function scrollTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
}
