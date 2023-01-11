import { Checkboxland } from "checkboxland";
import { useEffect, useState } from "react";

import "./App.css";

const empty = [
  [0,0,0,0],
  [0,0,0,0],
  [0,0,0,0],
  [0,0,0,0],
]

const NUM_ROWS = 58;
const NUM_COLS = 78;

const endPoint = { x: 77, y: 57 };

const directions = [
  // 下、右、上、左的顺序
  { row: 1, col: 0 },
  { row: 0, col: 1 },
  { row: -1, col: 0 },
  { row: 0, col: -1 },
];

let ended = false

function checkMazeHelper(maze, row, col, opt) {
  if (ended) {
    return;
  }

  opt.step++;
  

  // 标记当前点为已访问
  maze[row][col] = 2;
  // 随机排列方向
  // shuffle(directions);

  // 搜索周围的点
  for (const { row: dr, col: dc } of directions) {
    let valid = isValidMove(maze, row + dr, col + dc);
    // console.log('valid', valid, row + dr, col + dc);
    if (valid) {
      checkMazeHelper(maze, row + dr, col + dc, opt);
    }
  }
}

function isValidMove(maze, row, col) {
  if (row === endPoint.y && col === endPoint.x) {
    console.log('arrive end', col, row);
    ended = true;
    return false;
  }

  return (
    row >= 0 &&
    row < NUM_ROWS &&
    col >= 0 &&
    col < NUM_COLS &&
    maze[row][col] === 0
  );
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function App() {
  const [resetCount, setResetCount] = useState(0);
  const [hard, setHard] = useState(0); 
  const [player, setPlayer] = useState({x: 1, y:1});
  const [ground, setGround] = useState(null);
  useEffect(() => {
    console.log('init');
    const cbl = new Checkboxland({
      dimensions: "78x58",
      selector: "#my-container",
    });

    setGround(cbl);

    let data = cbl.getData();

    let times = 100;
    while(times-->0) {
      data = data.map(line => {
        return line.map(cell => {
          let a = Math.random() > 0.6;
          return a ? 1 : 0;
        });
      })
  
      cbl.setData(data);
      cbl.setData(empty, {x:0, y:0});
      cbl.setData(empty, {x:74, y:54});
      data = cbl.getData();
      ended = false;
      let opt = {step: 0};
      checkMazeHelper(data, 0, 0, opt);
      console.log('ended', ended, opt);
      if (ended) {
        setHard(opt.step);
        break;
      }
    }

    //clear 2
    data = data.map(line => {
      return line.map(cell => {
        return cell === 2 ? 0 : cell;
      });
    })
    
    cbl.setData(data);

    cbl.onClick(v=>{
      console.log('v', v.checkbox.checked);
      v.checkbox.checked = !v.checkbox.checked
    });
    return () => {
      console.log('destory');
      cbl.onClick.cleanUp();
      ended = false;
      setPlayer({x:1, y:1});
    }

  }, [resetCount]);

  useEffect(() => {
    if (!ground) {
      return;
    }
    let data = ground.getData();
    //clear 2
    data = data.map(line => {
      return line.map(cell => {
        return cell === 2 ? 0 : cell;
      });
    })
    ground.setData(data);

    ground.setData([[2]], player);
  }, [player, ground]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Your code here
      // console.log('event', event);
      let data = ground.getData();

      switch(event.key) {
        case 'ArrowUp':
        case 'w':
          setPlayer((pre)=>{
            if (pre.y-1 < 0 || data[pre.y - 1][pre.x] === 1) {
              return pre;
            }
            return {x: pre.x, y: pre.y - 1};
          });
          break;
        case 'ArrowDown':
        case 's':
          setPlayer((pre)=>{
            if (pre.y+1 >= NUM_ROWS || data[pre.y + 1][pre.x] === 1) {
              return pre;
            }
            return {x: pre.x, y: pre.y + 1};
          });
          break;
        case 'ArrowLeft':
        case 'a':
          setPlayer((pre)=>{
            if (pre.x-1 <0 ||  data[pre.y][pre.x - 1] === 1) {
              return pre;
            }
            return {x: pre.x - 1, y: pre.y};
          });
          break;
        case 'ArrowRight':
        case 'd':
          setPlayer((pre)=>{
            if (pre.x + 1 >= NUM_COLS || data[pre.y][pre.x + 1] === 1) {
              return pre;
            }
            return {x: pre.x + 1, y: pre.y};
          });
          break;
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    }
  }, [ground])
  
  return (
    <div className="App">
      <div className="App-header">
        难度值: {hard}
        <div id="my-container"/>
        <button onClick={()=>{
          console.log('hi')
          setResetCount(resetCount + 1);
        }}>Reset</button>
      </div>
    </div>
  );
}

export default App;
