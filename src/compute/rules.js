const AIR = 0;
const CROAD = 1;
const VROAD = 2;
const HROAD = 3;
const NROAD = 4;
const EROAD = 5;
const SROAD = 6;
const WROAD = 7;

export default {
  [AIR]: [
    [AIR, HROAD, SROAD, EROAD, WROAD],
    [AIR, VROAD, WROAD, NROAD, SROAD],
    [AIR, HROAD, NROAD, EROAD, WROAD],
    [AIR, VROAD, EROAD, NROAD, SROAD],
  ],
  [CROAD]: [
    [CROAD, VROAD, NROAD],
    [CROAD, HROAD, EROAD],
    [CROAD, VROAD, SROAD],
    [CROAD, HROAD, WROAD],
  ],
  [VROAD]: [
    [CROAD, VROAD, NROAD],
    [AIR, WROAD],
    [CROAD, VROAD, SROAD],
    [AIR, EROAD],
  ],
  [HROAD]: [
    [AIR, SROAD],
    [CROAD, HROAD, EROAD],
    [AIR, NROAD],
    [CROAD, HROAD, WROAD],
  ],
  [NROAD]: [
    [AIR, HROAD, EROAD, WROAD, SROAD],
    [AIR, WROAD, SROAD],
    [CROAD, VROAD],
    [AIR, EROAD, SROAD],
  ],
  [EROAD]: [
    [AIR, SROAD, WROAD],
    [AIR, VROAD, NROAD, SROAD],
    [AIR, NROAD, WROAD],
    [CROAD, HROAD],
  ],
  [SROAD]: [
    [CROAD, VROAD],
    [AIR, WROAD, NROAD],
    [AIR, HROAD, EROAD, WROAD],
    [AIR, EROAD, NROAD],
  ],
  [WROAD]: [
    [AIR, SROAD, EROAD],
    [CROAD, HROAD],
    [AIR, NROAD, EROAD],
    [AIR, VROAD, NROAD, SROAD],
  ],
};
