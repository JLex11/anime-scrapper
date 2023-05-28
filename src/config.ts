let config = {
  originPath: ''
};

export const setOriginPath = (url: string) => {
  config.originPath = url;
};

export const getOriginPath = () => {
  return config.originPath;
};