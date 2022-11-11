const AIR = 0;
const CROSS = 1;
const VLINE = 2;
const HLINE = 3;
const NCAP = 4;
const ECAP = 5;
const SCAP = 6;
const WCAP = 7;

export default {
  [AIR]: [
    [AIR, HLINE, SCAP, ECAP, WCAP],
    [AIR, VLINE, WCAP, NCAP, SCAP],
    [AIR, HLINE, NCAP, ECAP, WCAP],
    [AIR, VLINE, ECAP, NCAP, SCAP],
  ],
  [CROSS]: [
    [CROSS, VLINE, NCAP],
    [CROSS, HLINE, ECAP],
    [CROSS, VLINE, SCAP],
    [CROSS, HLINE, WCAP],
  ],
  [VLINE]: [
    [CROSS, VLINE, NCAP],
    [AIR, WCAP],
    [CROSS, VLINE, SCAP],
    [AIR, ECAP],
  ],
  [HLINE]: [
    [AIR, SCAP],
    [CROSS, HLINE, ECAP],
    [AIR, NCAP],
    [CROSS, HLINE, WCAP],
  ],
  [NCAP]: [
    [AIR, HLINE, ECAP, WCAP, SCAP],
    [AIR, WCAP, SCAP],
    [CROSS, VLINE],
    [AIR, ECAP, SCAP],
  ],
  [ECAP]: [
    [AIR, SCAP, WCAP],
    [AIR, VLINE, NCAP, SCAP],
    [AIR, NCAP, WCAP],
    [CROSS, HLINE],
  ],
  [SCAP]: [
    [CROSS, VLINE],
    [AIR, WCAP, NCAP],
    [AIR, HLINE, ECAP, WCAP],
    [AIR, ECAP, NCAP],
  ],
  [WCAP]: [
    [AIR, SCAP, ECAP],
    [CROSS, HLINE],
    [AIR, NCAP, ECAP],
    [AIR, VLINE, NCAP, SCAP],
  ],
};
