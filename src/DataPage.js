import React from "react";

function DataPage({list, 
    showAssignments, 
    setShowAssignments, 
    assignmentList, 
    setAssignmentList, 
    setLoadDataPage, 
    curClass, 
    setCurClass, 
    addingAssignment, 
    setAddingAssignment, 
    updateClass,
    assignmentTypeSelected,
    setAssignmentTypeSelected,
    gradingScale,
    pointAmountError,
    setPointAmountError,
    showAssignmentDetail,
    setShowAssignmentDetail,
    curAssignment,
    setCurAssignment,
    curAssignmentIndex,
    setCurAssignmentIndex,
    editAssignmentTypeSelected,
    setEditAssignmentTypeSelected
    }){

    const onClassClick = ({item}) => {
        setCurClass(item);
        setAssignmentList(item.assignments);
        setAssignmentTypeSelected(item.assignmentTypes[0].type);
        setShowAssignments(true);
    };

    const onBackClick = () => {
        if (showAssignments){
            if(addingAssignment){
                setAddingAssignment(false);
            }
            else if (showAssignmentDetail){
                setShowAssignmentDetail(false);
            }
            else{
                setShowAssignments(false);
            }
        }
        else{
            setLoadDataPage(false);
        }
    }

    const loadAddAssignmentPage = () => {
        setAddingAssignment(true);
        setPointAmountError(false);
        for (let i = 0; i < curClass.assignmentTypes.length; i++){
            console.log(curClass.assignmentTypes[i].type + ": " + 
                curClass.assignmentTypes[i].points.current + "/" + 
                curClass.assignmentTypes[i].points.possible + " " + 
                curClass.assignmentTypes[i].weight.standard.substring(
                    0,curClass.assignmentTypes[i].weight.standard.length-1)/100
                     + "of total");
        }
    }

    const addAssignment = () => {
        setPointAmountError(false);
        let pointsScored = Number(document.getElementById('pointsScoredInput').value);
        let pointsPossible = Number(document.getElementById('pointsPossibleInput').value);
        if (pointsScored >= 0 && pointsPossible >= 0 && pointsScored <= pointsPossible){
            let newAssignment = {
                name: document.getElementById('nameInput').value, 
                points: pointsScored + " / " + pointsPossible,
                type: assignmentTypeSelected};
            let newAssignmentList = [newAssignment];
            let finalList = newAssignmentList.concat(assignmentList);
            // Calculate new grade
            let totalPointsScored = 0;
            let totalPointsPossible = 0;
            let rawGrade = 0;
            for (let i = 0; i < curClass.assignmentTypes.length; i++){
                let weight = curClass.assignmentTypes[i].weight.standard.substring(0,
                    curClass.assignmentTypes[i].weight.standard.length-1) / 100;
                if (curClass.assignmentTypes[i].type === assignmentTypeSelected){
                    totalPointsScored = Number(curClass.assignmentTypes[i].points.current)
                     + pointsScored;
                    totalPointsPossible = Number(curClass.assignmentTypes[i].points.possible)
                     + pointsPossible;
                    rawGrade += (totalPointsScored / totalPointsPossible) * weight;
                    console.log(curClass.assignmentTypes[i].type + ": " + 
                        totalPointsScored + "/" + totalPointsPossible + " " + weight);
                }
                else {
                    rawGrade += (Number(curClass.assignmentTypes[i].points.current) / 
                    Number(curClass.assignmentTypes[i].points.possible)) * weight;
                }
            }
            rawGrade *= 100;
            rawGrade = rawGrade.toFixed(2);
            console.log("new grade: " + rawGrade);
    
            let letterGrade = "";
            if (gradingScale.A !== null && rawGrade >= gradingScale.A[0] && rawGrade <= gradingScale.A[1]){
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
            updateClass(curClass.id, 
                rawGrade, 
                letterGrade, 
                assignmentTypeSelected, 
                totalPointsScored, 
                totalPointsPossible, 
                "",
                "",
                "",
                finalList);
            setAddingAssignment(false);
        }
        else{
            setPointAmountError(true);
        }
    }

    const dropdownChange = (event) => {
        const value = event.target.value;
        setAssignmentTypeSelected(value);
    }

    const editDropdownChange = (event) => {
        const value = event.target.value;
        setEditAssignmentTypeSelected(value);
    }

    const onAssignmentClick = ({assignment, index}) => {
        setCurAssignment(assignment);
        setCurAssignmentIndex(index);
        setEditAssignmentTypeSelected(assignment.type);
        setPointAmountError(false);
        setShowAssignmentDetail(true);
    }

    const getCurPoints = (curPoints) => {
        let val = '';
        let str = curPoints === undefined ? curAssignment.points.trim() : curPoints.trim();
        if (str.indexOf("/") !== -1){
            let endIndex = str.indexOf(" ");
            if (endIndex === -1){
                endIndex = str.indexOf("/");
            }
            val = str.substring(0,endIndex);
        }
        return val;
    }

    const getCurPointsPossible = (curPoints) => {
        let val = '';
        let str = curPoints === undefined ? curAssignment.points.trim() : curPoints.trim();
        for (let i = str.length-1; i > 0; i--){
            if (str.charAt(i) === " " || str.charAt(i) === "/"){
                val = str.substring(i+1);
                break;
            }
        }
        return val;
    }

    const onEditAssignment = () => {
        setPointAmountError(false);
        let pointsScored = Number(document.getElementById('editPointsScoredInput').value);
        let pointsPossible = Number(document.getElementById('editPointsPossibleInput').value);
        let curAssignmentName = curAssignment.name;
        let curAssignmentPoints = curAssignment.points;
        let curAssignmentType = curAssignment.type;

        if (!(pointsScored === 0 && pointsPossible === 0) && pointsScored >= 0 && pointsPossible >= 0 && pointsScored <= pointsPossible){
            let newAssignmentList = [];
            newAssignmentList = newAssignmentList.concat(assignmentList);
            if (curAssignmentName !== document.getElementById('editNameInput').value){
                newAssignmentList[curAssignmentIndex].name = document.getElementById('editNameInput').value;
            }
            if (curAssignmentPoints !== pointsScored + " / " + pointsPossible){
                newAssignmentList[curAssignmentIndex].points = pointsScored + " / " + pointsPossible;
            }
            if (curAssignmentType !== editAssignmentTypeSelected){
                newAssignmentList[curAssignmentIndex].type = editAssignmentTypeSelected;
            }

            let totalPointsScored = "";
            let totalPointsPossible = "";
            let totalPointsScoredOld = "";
            let totalPointsPossibleOld = "";
            let rawGrade = "";
            let letterGrade = "";
            if (curAssignmentPoints !== pointsScored + " / " + pointsPossible || curAssignmentType !== editAssignmentTypeSelected){
                // Calculate new grade
                totalPointsScored = 0;
                totalPointsPossible = 0;
                rawGrade = 0;
                if (editAssignmentTypeSelected === curAssignmentType){
                    let pointsScoredDif = pointsScored - getCurPoints(curAssignmentPoints);
                    let pointsPossibleDif = pointsPossible - getCurPointsPossible(curAssignmentPoints);
                    for (let i = 0; i < curClass.assignmentTypes.length; i++){
                        let weight = curClass.assignmentTypes[i].weight.standard.substring(0,
                            curClass.assignmentTypes[i].weight.standard.length-1) / 100;
                        if (curClass.assignmentTypes[i].type === editAssignmentTypeSelected){
                            totalPointsScored = Number(curClass.assignmentTypes[i].points.current)
                                + pointsScoredDif;
                            totalPointsPossible = Number(curClass.assignmentTypes[i].points.possible)
                                + pointsPossibleDif;
                            rawGrade += (totalPointsScored / totalPointsPossible) * weight;
                            console.log(curClass.assignmentTypes[i].type + ": " + 
                                totalPointsScored + "/" + totalPointsPossible + " " + weight);
                        }
                        else {
                            rawGrade += (Number(curClass.assignmentTypes[i].points.current) / 
                            Number(curClass.assignmentTypes[i].points.possible)) * weight;
                        }
                    }
                }
                else{
                    for (let i = 0; i < curClass.assignmentTypes.length; i++){
                        let weight = curClass.assignmentTypes[i].weight.standard.substring(0,
                            curClass.assignmentTypes[i].weight.standard.length-1) / 100;
                        if (curClass.assignmentTypes[i].type === editAssignmentTypeSelected){
                            totalPointsScored = Number(curClass.assignmentTypes[i].points.current)
                                + pointsScored;
                            totalPointsPossible = Number(curClass.assignmentTypes[i].points.possible)
                                + pointsPossible;
                            rawGrade += (totalPointsScored / totalPointsPossible) * weight;
                            console.log(curClass.assignmentTypes[i].type + ": " + 
                                totalPointsScored + "/" + totalPointsPossible + " " + weight);
                        }
                        else if (curClass.assignmentTypes[i].type === curAssignmentType){
                            totalPointsScoredOld = Number(curClass.assignmentTypes[i].points.current)
                                - getCurPoints(curAssignmentPoints);
                            totalPointsPossibleOld = Number(curClass.assignmentTypes[i].points.possible)
                                - getCurPointsPossible(curAssignmentPoints);
                            rawGrade += (totalPointsScoredOld / totalPointsPossibleOld) * weight;
                        }
                        else{
                            rawGrade += (Number(curClass.assignmentTypes[i].points.current) / 
                            Number(curClass.assignmentTypes[i].points.possible)) * weight;
                        }
                    }
                }
                
                rawGrade *= 100;
                rawGrade = rawGrade.toFixed(2);
                console.log("new grade: " + rawGrade);

                
                if (gradingScale.A !== null && rawGrade >= gradingScale.A[0] && rawGrade <= gradingScale.A[1]){
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

            console.log("raw grade: " + rawGrade);
            console.log("assignment type edited: " + editAssignmentTypeSelected);
            console.log("total scored: " + totalPointsScored);
            console.log("total possible: " + totalPointsPossible);

            //add old totals to this and check for "" in updateClass
            updateClass(curClass.id, 
                rawGrade, 
                letterGrade, 
                editAssignmentTypeSelected, 
                totalPointsScored, 
                totalPointsPossible, 
                totalPointsScoredOld,
                totalPointsPossibleOld,
                curAssignmentType,
                newAssignmentList);
            setShowAssignmentDetail(false);
        }
        else{
            //check if it didn't have points before first
            if (curAssignmentPoints.trim().indexOf("/") === -1 && (pointsScored === 0 && pointsPossible === 0)){
                //save without recalculating grade
                let newAssignmentList = [];
                newAssignmentList = newAssignmentList.concat(assignmentList);
                if (curAssignmentName !== document.getElementById('editNameInput').value){
                    newAssignmentList[curAssignmentIndex].name = document.getElementById('editNameInput').value;
                }
                if (curAssignmentType !== editAssignmentTypeSelected){
                    newAssignmentList[curAssignmentIndex].type = editAssignmentTypeSelected;
                }

                updateClass(curClass.id, 
                    '', 
                    '', 
                    editAssignmentTypeSelected, 
                    '', 
                    '', 
                    '', 
                    '', 
                    '',
                    newAssignmentList);
                setShowAssignmentDetail(false);
            }
            else{
                setPointAmountError(true);
            }
        }
    }

    const deleteAssignment = () => {
        let curAssignmentPoints = curAssignment.points;
        //delete assignment
        let newAssignmentList = [];
            newAssignmentList = newAssignmentList.concat(assignmentList);
            newAssignmentList.splice(curAssignmentIndex, 1);

        if (curAssignmentPoints.trim().indexOf("/") === -1){
            //update assignments but not grade
            updateClass(curClass.id, 
                '', 
                '', 
                '', 
                '', 
                '',
                '', 
                '', 
                '',
                newAssignmentList);
        }
        else{
            //recalculate
            let pointsScored = getCurPoints(curAssignmentPoints);
            let pointsPossible = getCurPointsPossible(curAssignmentPoints);
            let curAssignmentType = curAssignment.type;
            
            let totalPointsScored = 0;
            let totalPointsPossible = 0;
            let rawGrade = 0;
            for (let i = 0; i < curClass.assignmentTypes.length; i++){
                let weight = curClass.assignmentTypes[i].weight.standard.substring(0,
                    curClass.assignmentTypes[i].weight.standard.length-1) / 100;
                if (curClass.assignmentTypes[i].type === curAssignmentType){
                    totalPointsScored = Number(curClass.assignmentTypes[i].points.current)
                        - pointsScored;
                    totalPointsPossible = Number(curClass.assignmentTypes[i].points.possible)
                        - pointsPossible;
                    rawGrade += (totalPointsScored / totalPointsPossible) * weight;
                    // console.log(curClass.assignmentTypes[i].type + ": " + 
                    //     totalPointsScored + "/" + totalPointsPossible + " " + weight);
                }
                else {
                    rawGrade += (Number(curClass.assignmentTypes[i].points.current) / 
                    Number(curClass.assignmentTypes[i].points.possible)) * weight;
                }
            }
            
            rawGrade *= 100;
            rawGrade = rawGrade.toFixed(2);
            console.log("new grade: " + rawGrade);

            let letterGrade = "";
            if (gradingScale.A !== null && rawGrade >= gradingScale.A[0] && rawGrade <= gradingScale.A[1]){
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

            updateClass(curClass.id, 
                rawGrade, 
                letterGrade, 
                curAssignmentType, 
                totalPointsScored, 
                totalPointsPossible, 
                '', 
                '', 
                '',
                newAssignmentList);
        }
        setShowAssignmentDetail(false);
    }

    console.log("rendered");
    console.log("assignmentList: " + assignmentList);

    return (<div style={{ 
        flexDirection: 'column',  
        alignItems: 'center',    
        justifyContent: 'center',
        backgroundColor: '#5b6476',
        overflowY: 'auto', 
        paddingTop: '5px',
        paddingBottom: '20px',
        boxSizing: 'border-box',
        width: '100vw',
        height: '100vh'}}>
        <div style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            paddingBottom: '10px'
        }}
        >
            <div style={{
                flex: 1,
                justifyContent: "flex-start",
                display: "flex"
            }}>
                <button style={{
                    backgroundColor: '#d1c2a3',
                    border: 'none',
                    color: '#5b6476',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '16px',
                    borderRadius: '5px',
                    padding: '5px 10px',
                    margin: '10px'
                }}
                    onClick={onBackClick}
                    >{showAssignments ? "Back" : "Sign out"}</button>
            </div>
            <div style={{
                flex: 4,
                justifyContent: "center",
                display: "flex",
                alignItems: 'center'
            }}>
                 <h2 style={{
                    margin: 0,
                    textAlign: 'center',
                    color: 'white'
                }}>{!showAssignments ? "Classes" : curClass.title}</h2>
                {showAssignments ? <h2 style={{
                    marginLeft: '10px', 
                    color: curClass.letterGrade.toLowerCase() === "a" ? 'lime' : 
                        curClass.letterGrade.toLowerCase() === "b" ? 'orange' : 
                        curClass.letterGrade.toLowerCase() === "c" ? 'yellow' : 
                        curClass.letterGrade.toLowerCase() === "d" ? 'cyan' : 'red'}}>
                        {curClass.letterGrade} {curClass.rawGrade}%</h2> : null}
            </div>
            <div style={{
                flex: 1,
                justifyContent: "flex-end",
                display: "flex",
                alignItems: 'center'
            }}>
                {showAssignments && !addingAssignment && !showAssignmentDetail ? <strong 
                onClick={loadAddAssignmentPage}
                style={{
                    color: '#d1c2a3',
                    fontSize: '18px'
                }}>Add Assignment</strong> : null}
                {showAssignments && !addingAssignment && !showAssignmentDetail ? <button 
                    onClick={loadAddAssignmentPage}
                    style={{
                    borderRadius: '50px',
                    height: '40px',
                    width: '40px',
                    marginLeft: '10px',
                    marginRight: '10px',
                    fontSize: '24px',
                    backgroundColor: 'transparent',
                    color: '#d1c2a3',
                    borderColor: '#d1c2a3',
                    borderWidth: '4px',
                    borderStyle: 'solid',
                    cursor: 'pointer'
                }}>+</button> : null}
            </div>
        </div>
        {!showAssignments ? (
            <div
            style={{
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'nowrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '15px',
            width: '100vw'
            }}
            >
                {list.map((item, index) => (
                <div
                    key={index}
                    onClick={() => onClassClick({item})}
                    style={{
                    border: '3px solid #d1c2a3',
                    borderRadius: '8px',
                    paddingTop: '10px',
                    paddingBottom: '10px',
                    paddingLeft: '20px',
                    paddingRight: '20px',
                    width: '70%',
                    textAlign: 'center',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    backgroundColor: 'transparent',
                    color: 'white',
                    fontSize: '16px',
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center' 
                    }}
                >
                    <p style={{fontSize: '18px'}}><strong>{item.id}</strong> {item.title}</p>
                    <strong style={{color: item.letterGrade.toLowerCase() === "a" ? 'lime' : 
                        item.letterGrade.toLowerCase() === "b" ? 'orange' : 
                        item.letterGrade.toLowerCase() === "c" ? 'yellow' : 
                        item.letterGrade.toLowerCase() === "d" ? 'cyan' : 'red'}}>
                            {item.letterGrade} {item.rawGrade}%
                    </strong>
                </div>
                ))}
            </div>
        ) : (
            <div style={{display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',}}>
                {!addingAssignment && !showAssignmentDetail ? 
                    Array.isArray(assignmentList) && 
                    assignmentList.length > 0 ? (assignmentList.map((assignment, index) => (
                    <div
                    onClick={() => onAssignmentClick({assignment, index})}
                    key={index}
                    style={{
                    border: '3px solid #d1c2a3',
                    borderRadius: '8px',
                    paddingTop: '10px',
                    paddingBottom: '10px',
                    paddingLeft: '20px',
                    paddingRight: '20px',
                    width: '70%',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    backgroundColor: 'transparent',
                    color: 'white',
                    fontSize: '16px',
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center' 
                    }}
                    >
                        <p>{assignment?.name || "Unnamed Assignment"}{" "}</p>
                        <div style={{
                            justifyContent: 'end',
                            alignItems: 'center',
                            textAlign:'right',
                            display: 'flex',
                            flexDirection: 'row',

                        }}>
                            <strong style={{color: '#d1c2a3'}}>{assignment.type}</strong>
                            <strong style={{
                                textAlign: 'end', 
                                justifyContent: 'end', 
                                marginLeft: '15px'}}>
                                {assignment?.points || ""}
                            </strong>
                        </div>
                    </div>
                ))) : null : 
                    ( !showAssignmentDetail ?
                    <div style={{
                        flex: 1,                  
                        display: 'flex',          
                        flexDirection: 'column',  
                        alignItems: 'center',     
                        justifyContent: 'start',
                        height: '100%',
                        width: '50%',
                    }}>
                        <h2 style={{
                            textAlign: 'center', 
                            marginBottom: '20px', 
                            color: '#d1c2a3' }}
                            >Add Assignment</h2>
                        <div style={{
                            marginBottom: '15px', 
                            width: '50%' }}>
                            <strong style={{
                                display: 'block', 
                                marginBottom: '5px', 
                                textAlign: 'left', 
                                color: '#d1c2a3', 
                                fontSize: '18px'}}
                                >Name:</strong>
                            <input
                                id="nameInput"
                                type="text"
                                placeholder="Enter name"
                                style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #d1c2a3',
                                borderRadius: '4px',
                                fontSize: '16px',
                                backgroundColor: 'transparent',
                                color: 'white',
                                boxSizing: 'border-box',
                                }}
                                defaultValue="New Assignment"
                            />
                        </div>
                        <div style={{marginBottom: '15px', width: '50%'}}>
                            <strong style={{
                                display: 'block', 
                                marginBottom: '5px', 
                                textAlign: 'left', 
                                color: '#d1c2a3', 
                                fontSize: '18px'}}
                                >Points Scored:</strong>
                            <input
                                type="number"
                                id="pointsScoredInput"
                                placeholder="Enter points scored"
                                style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #d1c2a3',
                                borderRadius: '4px',
                                fontSize: '16px',
                                backgroundColor: 'transparent',
                                color: 'white',
                                boxSizing: 'border-box',
                                }}
                            />
                        </div>
                        <div style={{
                            marginBottom: '15px', 
                            width: '50%'}}>
                            <strong style={{
                                display: 'block', 
                                marginBottom: '5px', 
                                textAlign: 'left', 
                                color: '#d1c2a3', 
                                fontSize: '18px'}}
                                >Points Possible:</strong>
                            <input
                                type="number"
                                id="pointsPossibleInput"
                                placeholder="Enter points possible"
                                style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #d1c2a3',
                                borderRadius: '4px',
                                fontSize: '16px',
                                backgroundColor: 'transparent',
                                color: 'white',
                                boxSizing: 'border-box',
                                }}
                            />
                        </div>
                        <div style={{
                            marginBottom: '15px',
                            width: '50%'
                        }}>
                            <strong style={{
                                display: 'block', 
                                marginBottom: '5px', 
                                textAlign: 'left', 
                                color: '#d1c2a3', 
                                fontSize: '18px'}}
                                >Assignment Type:</strong>
                            <select
                                value={assignmentTypeSelected}
                                onChange={dropdownChange}
                                style={{
                                    padding: "8px",
                                    borderRadius: "5px",
                                    border: "2px solid #d1c2a3",
                                    backgroundColor: "transparent",
                                    color: "#d1c2a3",
                                    fontSize: "16px",
                                    width: '100%'
                                }}>
                                {curClass.assignmentTypes.map((option, index) => (
                                    <option key={index} value={option.type}>
                                        {option.type}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div style={{
                            width: '50%'
                        }}>
                            <p hidden={!pointAmountError} style={{
                                textAlign: 'center', 
                                color: 'red', 
                                fontSize: '18px', 
                                marginTop: '0px', 
                                marginBottom: '5px'}}
                                >Point values not valid</p>
                            <button 
                            onClick={addAssignment}
                            style={{
                                width: '150px',
                                padding: '10px',
                                backgroundColor: '#d1c2a3',
                                color: '#5b6476',
                                fontSize: '16px',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                marginTop: '5px'
                            }}>Add</button>
                        </div>
                    </div> : 
                    // Show Assignment Details
                    <div style={{
                        flex: 1,                  
                        display: 'flex',          
                        flexDirection: 'column',  
                        alignItems: 'center',     
                        justifyContent: 'start',
                        height: '100%',
                        width: '50%',
                    }}>
                        <h2 style={{
                            textAlign: 'center', 
                            marginBottom: '20px', 
                            color: '#d1c2a3' }}
                            >Edit Assignment</h2>
                        <div style={{
                            marginBottom: '15px', 
                            width: '50%' }}>
                            <strong style={{
                                display: 'block', 
                                marginBottom: '5px', 
                                textAlign: 'left', 
                                color: '#d1c2a3', 
                                fontSize: '18px'}}
                                >Name:</strong>
                            <input
                                id="editNameInput"
                                type="text"
                                placeholder="Enter name"
                                style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #d1c2a3',
                                borderRadius: '4px',
                                fontSize: '16px',
                                backgroundColor: 'transparent',
                                color: 'white',
                                boxSizing: 'border-box',
                                }}
                                defaultValue={curAssignment.name}
                            />
                        </div>
                        <div style={{marginBottom: '15px', width: '50%'}}>
                            <strong style={{
                                display: 'block', 
                                marginBottom: '5px', 
                                textAlign: 'left', 
                                color: '#d1c2a3', 
                                fontSize: '18px'}}
                                >Points Scored:</strong>
                            <input
                                type="number"
                                id="editPointsScoredInput"
                                placeholder="Enter points scored"
                                style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #d1c2a3',
                                borderRadius: '4px',
                                fontSize: '16px',
                                backgroundColor: 'transparent',
                                color: 'white',
                                boxSizing: 'border-box',
                                }}
                                defaultValue={getCurPoints()}
                            />
                        </div>
                        <div style={{
                            marginBottom: '15px', 
                            width: '50%'}}>
                            <strong style={{
                                display: 'block', 
                                marginBottom: '5px', 
                                textAlign: 'left', 
                                color: '#d1c2a3', 
                                fontSize: '18px'}}
                                >Points Possible:</strong>
                            <input
                                type="number"
                                id="editPointsPossibleInput"
                                placeholder="Enter points possible"
                                style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #d1c2a3',
                                borderRadius: '4px',
                                fontSize: '16px',
                                backgroundColor: 'transparent',
                                color: 'white',
                                boxSizing: 'border-box',
                                }}
                                defaultValue={getCurPointsPossible()}
                            />
                        </div>
                        <div style={{
                            marginBottom: '15px',
                            width: '50%'
                        }}>
                            <strong style={{
                                display: 'block', 
                                marginBottom: '5px', 
                                textAlign: 'left', 
                                color: '#d1c2a3', 
                                fontSize: '18px'}}
                                >Assignment Type:</strong>
                            <select
                                value={editAssignmentTypeSelected}
                                onChange={editDropdownChange}
                                style={{
                                    padding: "8px",
                                    borderRadius: "5px",
                                    border: "2px solid #d1c2a3",
                                    backgroundColor: "transparent",
                                    color: "#d1c2a3",
                                    fontSize: "16px",
                                    width: '100%'
                                }}>
                                
                                {curClass.assignmentTypes.map((option, index) => (
                                    <option key={index} value={option.type}>
                                        {option.type}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div style={{
                            width: '50%'
                        }}>
                            <p hidden={!pointAmountError} style={{
                                textAlign: 'center', 
                                color: 'red', 
                                fontSize: '18px', 
                                marginTop: '0px', 
                                marginBottom: '5px'}}
                                >Point values not valid</p>
                            <div
                            style={{
                                flexDirection: 'row',
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '15px'
                            }}>
                                <button 
                                onClick={deleteAssignment}
                                style={{
                                    width: '150px',
                                    padding: '10px',
                                    backgroundColor: 'red',
                                    color: 'white',
                                    fontSize: '16px',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    marginTop: '5px'
                                }}>Delete</button>
                                <button 
                                onClick={onEditAssignment}
                                style={{
                                    width: '150px',
                                    padding: '10px',
                                    backgroundColor: '#d1c2a3',
                                    color: '#5b6476',
                                    fontSize: '16px',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    marginTop: '5px'
                                }}>Save</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )} 
    </div>
    );
}

export default DataPage;