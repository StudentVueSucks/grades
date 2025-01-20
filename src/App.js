import './App.css';
import React, { useState, useEffect } from 'react';
import StudentVue from "studentvue";
import Spinner from './Spinner';
import DataPage from './DataPage';

async function getAcc(username, password){
    try{    
        return await StudentVue.login("https://md-mcps-psv.edupoint.com", {
            username: username,
            password: password,
        });
    }
    catch (e)
    {
        console.log(e);
        return;
    }
}


function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isError, setError] = useState(false);
  const [outputList, setOutputList] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [loadDataPage, setDataPage] = useState(false);
  const [showAssignments, setShowAssignments] = useState(false);
  const [assignmentList, setAssignmentList] = useState([]);
  const [curClass, setCurClass] = useState();
  const [addingAssignment, setAddingAssignment] = useState(false);
  const [assignmentTypeSelected, setAssignmentTypeSelected] = useState('');
  const [gradingScale, setGradingScale] = useState();
  const [pointAmountError, setPointAmountError] = useState(false);

  const updateClass = (id, rawGrade, letterGrade, assignmentType, assignmentTypePoints, assignmentTypePointsPossible, assignments) => {
    let outputListUpdated = outputList;
    for (let i = 0; i < outputListUpdated.length; i++){
      if (outputListUpdated[i].id === id){
        outputListUpdated[i].rawGrade = rawGrade;
        if (letterGrade !== ""){
          outputListUpdated[i].letterGrade = letterGrade;
        }
        outputListUpdated[i].assignments = assignments;
        for (let j = 0; j < outputListUpdated[i].assignmentTypes.length; j++){
          if (outputListUpdated[i].assignmentTypes[j].type === assignmentType){
            outputListUpdated[i].assignmentTypes[j].points.current = assignmentTypePoints;
            outputListUpdated[i].assignmentTypes[j].points.possible = assignmentTypePointsPossible;
          }
        }
        setCurClass(outputListUpdated[i]);
        break;
      }
    }
    setAssignmentList(assignments);
    setOutputList(outputListUpdated);
  };

  const onLogin = async (user, pass) => {
    setLoading(true);
    setShowAssignments(false);
    setError(false);
    let accUser = user === null ? username : user;
    let accPass = pass === null ? password : pass;
    // console.log("user: " + accUser);
    // console.log("pass: " + accPass);
    const client = await getAcc(accUser, accPass);
    // console.log(client);
    if (client != null){
      const gradebook = await client[0].gradebook();
      setGradingScale(gradebook.gradingScale);
      let classList = [];
      for (let i = 0; i < gradebook.courses.length; i++){
        let add = gradebook.courses[i];
        let weights = add.marks[0]?.weightedCategories;
        let filteredWeights = [];
        for (let i = 0; i < weights.length; i++){
          if (weights[i].type.toLowerCase().trim() !== "total"){
            filteredWeights.push(weights[i]);
          }
        }
        
        classList.push({id: i >=4 ? i + 2 : i + 1, title: add.title, 
          letterGrade: add.marks[0]?.calculatedScore?.string || "N/A",
          rawGrade: add.marks[0]?.calculatedScore?.raw || 0,
          assignments: add.marks[0]?.assignments || [],
          assignmentTypes: filteredWeights});
      }
      setOutputList(classList);
      setDataPage(true);
    }
    else{
      setError(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    const handleKeyPress = async (event) => {
      if (event.key === "Enter") {
        setUsername(document.getElementById('usernameInput').value);
        setPassword(document.getElementById('passwordInput').value);

        await onLogin(document.getElementById('usernameInput').value, document.getElementById('passwordInput').value);
      }
    };

    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  const containerStyle = {
    display: 'flex',          
    width: '100vw',          
    height: '100vh',          
  };
  
  const mainDivStyle = {
    flex: 1,                  
    display: 'flex',          
    flexDirection: 'column',  
    alignItems: 'center',     
    justifyContent: 'center', 
    backgroundColor: '#5b6476', 
  };

  return (
    <div className="App" style={containerStyle}>
    {loadDataPage ? (
      <div style={mainDivStyle}>
        <DataPage list={outputList} 
        showAssignments={showAssignments} 
        setShowAssignments={setShowAssignments} 
        assignmentList={assignmentList} 
        setAssignmentList={setAssignmentList} 
        setLoadDataPage={setDataPage}
        curClass={curClass}
        setCurClass={setCurClass}
        addingAssignment={addingAssignment}
        setAddingAssignment={setAddingAssignment}
        updateClass={updateClass}
        assignmentTypeSelected={assignmentTypeSelected}
        setAssignmentTypeSelected={setAssignmentTypeSelected}
        gradingScale={gradingScale}
        pointAmountError={pointAmountError}
        setPointAmountError={setPointAmountError}/>
      </div>
    ) : (
      <div style={mainDivStyle}>
      <header className="App-header">
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Sign In</h2>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', textAlign: 'left' }}>ID:</label>
          <input
            id='usernameInput'
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter ID"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d1c2a3',
              borderRadius: '4px',
              fontSize: '16px',
              backgroundColor: 'transparent',
              color: 'white'
            }}
          />
        </div>
        <div style={{marginBottom: '10px'}}>
          <label style={{ display: 'block', marginBottom: '5px', textAlign: 'left' }}>Password:</label>
          <input
            id='passwordInput'
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d1c2a3',
              borderRadius: '4px',
              fontSize: '16px',
              backgroundColor: 'transparent',
              color: 'white'
            }}
          />
        </div>
        <p hidden={!isError} style={{textAlign: 'center', color: 'red', fontSize: '18px', marginTop: '0px', marginBottom: '0px'}}>Incorrect ID or Password</p>
        {isLoading ? (<Spinner/>) : (<button
          onClick={() => onLogin(username, password)}
          style={{
            width: '150px',
            padding: '10px',
            backgroundColor: '#d1c2a3',
            color: '#5b6476',
            fontSize: '16px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Login
        </button>)}
      </header>
    </div>
    )}
  </div>
  );
}

export default App;
