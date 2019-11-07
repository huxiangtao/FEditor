export default {
  task: {
    type: 'rect', fill: '#FFF', width: '80', height: '45', x: 0, y: 0, strokeWidth: 1, stroke: '#000',
    dataBboxX: 0, dataBboxY: 0, dataBboxW: 80, dataBboxH: 45, dataCX: 80, dataCY: 45,
  },
  human: {
    type: 'polygon', fill: '#FFF', stroke: "#000", points: '20,2 60,2 78,14 78,31 60,44 20,44 1,31 1,14', strokeWidth: 1,
    dataBboxX: 0, dataBboxY: 0, dataBboxW: 80, dataBboxH: 45, dataCX: 80, dataCY: 45,
  },
  pause: {
    type: 'circle', fill: '#FFF', stroke: "#000", cx: 0, cy: 0, strokeWidth: 1, r: 20,
    dataBboxX: -20, dataBboxY: -20, dataBboxW: 40, dataBboxH: 40, dataCX: 0, dataCY: 0,
  },
  logic: {
    type: 'logic', fill: '#FFF', stroke: "#000", strokeWidth: 1, d: "M 38 2 L 76 20 L 38 38 L 2 20 Z",
    dataBboxX: 0, dataBboxY: 0, dataBboxW: 76, dataBboxH: 38, dataCX: 35.5, dataCY: 19,
  },
};