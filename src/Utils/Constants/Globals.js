export const sidenavLargeWidth = 240;
export const sidenavSmallWidth = 60;

export const mainStyles = (size) => {
  return { width: `calc(100% - ${size})`, marginLeft: size, overflowX: "hidden" };
};

export const getContainerStyles = (size) => {
  if (size > 768) {
    return mainStyles(sidenavLargeWidth);
  } else if (size <= 768 && size > 500) {
    return mainStyles(sidenavSmallWidth);
  } else if (size <= 500) {
    return mainStyles(0);
  }
};
