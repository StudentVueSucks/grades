import './App.css';
import React, { useState, useEffect, useCallback } from 'react';
import StudentVue from "studentvue";
import Spinner from './Spinner';
import DataPage from './DataPage';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
      const handleResize = () => setIsMobile(window.innerWidth <= 768);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}

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
  const isMobile = useIsMobile();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isError, setError] = useState(false);
  const [outputList, setOutputList] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [loadDataPage, setDataPage] = useState(false);
  const [showAssignments, setShowAssignments] = useState(false);
  const [showAssignmentDetail, setShowAssignmentDetail] = useState(false);
  const [assignmentList, setAssignmentList] = useState([]);
  const [curClass, setCurClass] = useState();
  const [curAssignment, setCurAssignment] = useState();
  const [curAssignmentIndex, setCurAssignmentIndex] = useState();
  const [addingAssignment, setAddingAssignment] = useState(false);
  const [assignmentTypeSelected, setAssignmentTypeSelected] = useState('');
  const [editAssignmentTypeSelected, setEditAssignmentTypeSelected] = useState('');
  const [gradingScale, setGradingScale] = useState();
  const [pointAmountError, setPointAmountError] = useState(false);
  const [classHover, setClassHover] = useState([]);
  const [assignmentHover, setAssignmentHover] = useState([]);
  const [reportingPeriods, setReportingPeriods] = useState([]);
  const [curReportingPeriod, setCurReportingPeriod] = useState();
  const [curReportingPeriodIndex, setCurReportingPeriodIndex] = useState();
  const [isChangeLoading, setChangeLoading] = useState(false);
  const [periodHover, setPeriodHover] = useState(false);
  const [backButtonHover, setBackButtonHover] = useState(false);
  const [addAssignmentHover, setAddAssignmentHover] = useState(false);
  const [assignmentTypeHover, setAssignmentTypeHover] = useState(false);
  const [editAssignmentTypeHover, setEditAssignmentTypeHover] = useState(false);
  const [loginHover, setLoginHover] = useState(false);
  const [addButtonHover, setAddButtonHover] = useState(false);
  const [saveButtonHover, setSaveButtonHover] = useState(false);
  const [deleteButtonHover, setDeleteButtonHover] = useState(false);
  const [refreshButtonHover, setRefreshButtonHover] = useState(false);

  const updateClass = (
    id, 
    rawGrade, 
    letterGrade, 
    assignmentType, 
    assignmentTypePoints, 
    assignmentTypePointsPossible, 
    assignmentTypePointsOld, 
    assignmentTypePointsPossibleOld, 
    oldAssignmentType,
    assignments) => {
    let outputListUpdated = outputList;
    
    for (let i = 0; i < outputListUpdated.length; i++){
      if (outputListUpdated[i].id === id){
        if (rawGrade !== ""){
          outputListUpdated[i].rawGrade = rawGrade;
        }
        if (letterGrade !== ""){
          outputListUpdated[i].letterGrade = letterGrade;
        }
        outputListUpdated[i].assignments = assignments;
        for (let j = 0; j < outputListUpdated[i].assignmentTypes.length; j++){
          if (outputListUpdated[i].assignmentTypes[j].type === assignmentType){
            if (assignmentTypePoints !== ""){
              outputListUpdated[i].assignmentTypes[j].points.current = assignmentTypePoints;
            }
            if (assignmentTypePointsPossible !== ""){
              outputListUpdated[i].assignmentTypes[j].points.possible = assignmentTypePointsPossible;
            }
          }
          else if (oldAssignmentType !== "" && outputListUpdated[i].assignmentTypes[j].type === oldAssignmentType){
            if (assignmentTypePointsOld !== ""){
              outputListUpdated[i].assignmentTypes[j].points.current = assignmentTypePointsOld;
            }
            if (assignmentTypePointsPossibleOld !== ""){
              outputListUpdated[i].assignmentTypes[j].points.possible = assignmentTypePointsPossibleOld;
            }
          }
        }
        setCurClass(outputListUpdated[i]);
        break;
      }
    }

    setAssignmentList(assignments);
    setOutputList(outputListUpdated);
  };

  const onLogin = useCallback(async (user, pass, reportingPeriodIndex) => {
    let finalList = [];
    setLoading(true);
    setError(false);

    let accUser = user === null ? username : user;
    let accPass = pass === null ? password : pass;
    setUsername(user);
    setPassword(pass);

    const client = await getAcc(accUser, accPass);

    if (client != null){
      let curPeriod;
      if (reportingPeriodIndex !== undefined){
        curPeriod = reportingPeriodIndex;
      }
      const gradebook = await client[0].gradebook(curPeriod);
      setGradingScale(gradebook.gradingScale);
      setReportingPeriods(gradebook.reportingPeriod.available);
      setCurReportingPeriod(gradebook.reportingPeriod.current.name);
      setCurReportingPeriodIndex(gradebook.reportingPeriod.current.index);

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
        
        let letterGrade = add.marks[0]?.calculatedScore?.string;
        let rawGrade = add.marks[0]?.calculatedScore?.raw;
        let gradingScale = gradebook.gradingScale;
        if (letterGrade === "" || letterGrade === undefined || letterGrade === null || !isNaN(letterGrade)){
          //calculate letter grade
          if (gradingScale.A !== null && rawGrade >= gradingScale.A[0]){
            letterGrade = "A";
          }
          else if (gradingScale.B !== null && rawGrade >= gradingScale.B[0] && rawGrade <= gradingScale.B[1]){
              letterGrade = "B";
          }
          else if (gradingScale.C !== null && rawGrade >= gradingScale.C[0] && rawGrade <= gradingScale.C[1]){
              letterGrade = "C";
          }
          else if (gradingScale.D !== null && rawGrade >= gradingScale.D[0] && rawGrade <= gradingScale.D[1]){
              letterGrade = "D";
          }
          else if (gradingScale.E !== null && rawGrade >= gradingScale.E[0] && rawGrade <= gradingScale.E[1]){
              letterGrade = "E";
          }
          else if (gradingScale.F !== null && rawGrade >= gradingScale.E[0] && rawGrade <= gradingScale.E[1]) {
              letterGrade = "F";
          }
        }

        classList.push({id: i >=4 ? i + 2 : i + 1, title: add.title, 
          letterGrade: letterGrade || "N/A",
          rawGrade: rawGrade || 0,
          assignments: add.marks[0]?.assignments || [],
          assignmentTypes: filteredWeights});
      }

      setOutputList(classList);
      setClassHover(classList.map(() => false));
      setDataPage(true);
      finalList = classList;
    }
    else{
      setError(true);
    }
    setLoading(false);
    return finalList;
  }, [username, password]);

  useEffect(() => {
    const handleKeyPress = async (event) => {
      if (event.key === "Enter") {
        setUsername(document.getElementById('usernameInput').value);
        setPassword(document.getElementById('passwordInput').value);

        await onLogin(document.getElementById('usernameInput').value, 
        document.getElementById('passwordInput').value);
        setShowAssignments(false);
      }
    };

    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [onLogin]);

  const containerStyle = {
    display: 'flex', 
    flexDirection:'column',          
    width: isMobile ? '100%' : '100vw',          
    height: isMobile ? 'auto' : '100vh',          
  };
  
  const mainDivStyle = {
    flex: 1,                  
    display: 'flex',          
    flexDirection: 'column',  
    alignItems: isMobile ? 'stretch' : 'center',     
    justifyContent: isMobile ? 'flex-start' : 'center', 
    backgroundColor: '#5b6476', 
  };

  return (
    <div className="App" style={containerStyle}>
    {loadDataPage ? (
      <div style={mainDivStyle}>
        <DataPage classList={outputList} 
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
        setPointAmountError={setPointAmountError}
        showAssignmentDetail={showAssignmentDetail}
        setShowAssignmentDetail={setShowAssignmentDetail}
        curAssignment={curAssignment}
        setCurAssignment={setCurAssignment}
        curAssignmentIndex={curAssignmentIndex}
        setCurAssignmentIndex={setCurAssignmentIndex}
        editAssignmentTypeSelected={editAssignmentTypeSelected}
        setEditAssignmentTypeSelected={setEditAssignmentTypeSelected}
        classHover={classHover}
        setClassHover={setClassHover}
        assignmentHover={assignmentHover}
        setAssignmentHover={setAssignmentHover}
        reportingPeriods={reportingPeriods}
        setCurReportingPeriod={setCurReportingPeriod}
        curReportingPeriod={curReportingPeriod}
        setCurReportingPeriodIndex={setCurReportingPeriodIndex}
        curReportingPeriodIndex={curReportingPeriodIndex}
        onLogin={onLogin}
        username={username}
        password={password}
        isChangeLoading={isChangeLoading}
        setChangeLoading={setChangeLoading}
        periodHover={periodHover}
        setPeriodHover={setPeriodHover}
        backButtonHover={backButtonHover}
        setBackButtonHover={setBackButtonHover}
        addAssignmentHover={addAssignmentHover}
        setAddAssignmentHover={setAddAssignmentHover}
        assignmentTypeHover={assignmentTypeHover}
        setAssignmentTypeHover={setAssignmentTypeHover}
        editAssignmentTypeHover={editAssignmentTypeHover}
        setEditAssignmentTypeHover={setEditAssignmentTypeHover}
        addButtonHover={addButtonHover}
        setAddButtonHover={setAddButtonHover}
        saveButtonHover={saveButtonHover}
        setSaveButtonHover={setSaveButtonHover}
        deleteButtonHover={deleteButtonHover}
        setDeleteButtonHover={setDeleteButtonHover}
        refreshButtonHover={refreshButtonHover}
        setRefreshButtonHover={setRefreshButtonHover}
        isMobile={isMobile}
        />
      </div>
    ) : (
      
      <div style={{
          flex: 1,                  
          display: 'flex',          
          flexDirection: 'column',  
          alignItems: isMobile ? 'stretch' : 'center',     
          justifyContent: isMobile ? 'center' : 'center', 
          backgroundColor: '#5b6476',
          height: '100vh'}}>
          <h1 style={{
            color: '#d1c2a3',
            fontSize: isMobile ? '32px' : '46px',
            marginTop: isMobile ? '60px' : '200px'
          }}>StudentVue Sucks</h1>
          <header className="App-header" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
            // backgroundColor: 'blue',
          }}>
            <div style={{
              // backgroundColor: 'red',
              height: '80%',
            }}>
              <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Sign In</h2>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ 
                  display: 'block',
                  marginBottom: '5px', 
                  textAlign: 'left',
                  fontSize: '24px' }}
                  >ID:</label>
                <input
                  id='usernameInput'
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter ID"
                  style={{
                    width: '100%',
                    padding: isMobile ? '15px' : '10px',
                    border: '1px solid #d1c2a3',
                    borderRadius: '4px',
                    fontSize: '16px',
                    backgroundColor: 'transparent',
                    color: 'white'
                  }}
                />
              </div>
              <div style={{marginBottom: '10px'}}>
                <label style={{
                  display: 'block', 
                  marginBottom: '5px', 
                  textAlign: 'left',
                  fontSize: '24px' }}
                  >Password:</label>
                <input
                  id='passwordInput'
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  style={{
                    width: '100%',
                    padding: isMobile ? '15px' : '10px',
                    border: '1px solid #d1c2a3',
                    borderRadius: '4px',
                    fontSize: '16px',
                    backgroundColor: 'transparent',
                    color: 'white'
                  }}
                />
              </div>
              <p hidden={!isError} style={{
                textAlign: 'center', 
                color: 'red', 
                fontSize: '18px', 
                marginTop: '0px', 
                marginBottom: '0px'}}
                >Incorrect ID or Password</p>
              {isLoading ? (<Spinner/>) : (<button
                onClick={() => {
                  onLogin(username, password);
                  setShowAssignments(false);
                }}
                onMouseEnter={() => setLoginHover(true)}
                onMouseLeave={() => setLoginHover(false)}
                style={{
                  width: '150px',
                  padding: isMobile ? '15px' : '10px',
                  backgroundColor: loginHover ? '#e0d4b4' : '#d1c2a3',
                  color: '#5b6476',
                  fontSize: '16px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  marginTop: '10px',
                  transition: 'background-color 0.3s ease',
                }}
              >
                Login
              </button>)}
            </div>
          </header>
      </div>
    )}
  </div>
  );
}

export default App;