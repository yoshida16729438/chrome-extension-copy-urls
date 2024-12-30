const getDistinct = () => getCommon("distinct");

const setDistinct = (value) => setCommon("distinct", value);

const getIgnoreId = () => getCommon("ignoreId");

const setIgnoreId = (value) => setCommon("ignoreId", value);

const getIgnoreNotHttp = () => getCommon("ignoreNotHttp");

const setIgnoreNotHttp = (value) => setCommon("ignoreNotHttp", value);

const getAllWindows = () => getCommon("allWindows");

const setAllWindows = (value) => setCommon("allWindows", value);

const getCommon = async (propertyName) => {
  const obj = await chrome.storage.local.get(propertyName);
  return !!obj[propertyName];
};

const setCommon = async (propertyName, propertyValue) => {
  await chrome.storage.local.set({ [propertyName]: propertyValue });
};
