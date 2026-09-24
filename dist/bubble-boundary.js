// Decorative thought-bubble outline; items are free to leave for rescue.
export const bubbleCurves=[[46,242,10,240,8,197,22,172],[22,172,-1,137,9,59,35,42],[35,42,44,7,131,7,164,20],[164,20,225,-2,297,13,325,20],[325,20,395,-2,467,20,463,60],[463,60,485,118,469,171,464,181],[464,181,478,233,425,244,386,239],[386,239,292,261,124,247,46,242]];
export function drawBubble(c){c.beginPath();c.moveTo(46,242);for(const a of bubbleCurves)c.bezierCurveTo(...a.slice(2));c.closePath();c.stroke();}
