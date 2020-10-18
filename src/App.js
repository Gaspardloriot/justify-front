import React, { useState, useEffect } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form'
import { v4 as uuidv4 } from 'uuid';



function App() {

  const [state, setState] = useState({
    userID: '',
    emailValue:
      (typeof window.localStorage.email !== 'undefined')
        ?
        window.localStorage.email
        :
        '',
    characters: 0,
    textValue: '',
    justified: [],
    textArea: true,
    mainAnimation: 'slide 0.8s',
    showMax: false
  });

const url='https://powerful-ridge-42331.herokuapp.com';


  const emailInputHandler = (e) => {
    e.preventDefault(e);
    let email = e.target.value;
    setState(prevState => { return { ...prevState, emailValue: email } });
  }

  const changeInputHandler = (e) => {
    e.preventDefault(e);
    let text = e.target.value;
    setState(prevState => { return { ...prevState, textValue: text } });
  }

  const handlePress = (e) => {
    if (e.key === 'Enter') {
      validateEmail();
    }
  }


  const sendEmail = {
    email: state.emailValue,
  }
  const emailOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(sendEmail)
  };


  const validateEmail = () => {
    if (state.emailValue.length > 5) {
      const email = state.emailValue;
      var re = /\S+@\S+\.\S+/;
      const check = re.test(email);
      if (check) connect();
      else alert('Please enter a valid email');
    }
  }


  const connect = async () => {
    let response = await fetch(`${url}/add-connect`, emailOptions);
    let data = await response.json();
    let userData = data.user;
    let token = data.encrypted;
    let characters = userData.characters;
    let userId = userData._id;
    setState(prevState => { return { ...prevState, userID: userId, characters: characters } });
    window.localStorage.setItem('email', state.emailValue);
    window.localStorage.setItem('token', token);
  };


  const addingData = state.textValue;
  const addOptions = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${window.localStorage.token}`,
      'Content-Type': 'text/plain'
    },
    body: addingData
  };

  const justify = async () => {
    if (state.textValue.length > 84) {
      setState(prevState => { return { ...prevState, mainAnimation: 'deslide 1s' } });
      let response = await fetch(`${url}/justify/${state.userID}`, addOptions);
      let data = await response.json();
      setInterval(setState(prevState => {
        return {
          ...prevState,
          justified: data[0],
          textArea: false,
          mainAnimation: '',
          characters: data[1].characters
        }
      }),
        1200);
    } else {
      alert('Minimum characters per request is 85')
    }
  }
  const logOut = () => {
    setState(prevState => { return { ...prevState, userID: '', characters: 0, justifier: [], textValue: '', textArea: true } })
    window.localStorage.removeItem('email');
  }

  useEffect(validateEmail, [])

  return (
    <div className="App">
      <div id="navBar">JUSTIFIER
        <div id="logo">
          <img src="https://img.icons8.com/ios-filled/50/000000/rich-text-converter.png" alt="logo" />
        </div>
        <div
          id="status"
          style={{ display: (state.userID !== "") ? "flex" : "none" }}>
          <p>characters left:</p>
          <p>{state.characters.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</p>
          <meter
            id="disk_c"
            value={state.characters}
            min="0"
            max="80000"
            >2 out of 10
          </meter>
        </div>
        <Button
          variant="secondary"
          onClick={logOut}
          style={{ display: (state.userID !== "") ? "block" : "none" }}
        >Log Out
        </Button>
      </div>
      <section id="emailPrompt"
        style={{ display: (state.userID !== "") ? "none" : "block" }}
        onChange={(e) => emailInputHandler(e)}
        value={state.emailValue}>
        <p>
          Please enter your email to use Justifier
          </p>
        <input
          placeholder="Jean.Papin@yahoo.fr"
          type="email"
          onKeyPress={(e) => handlePress(e)} />
        <Button
          variant="primary"
          onClick={validateEmail}
          style={{ backgroundColor: "navy" }}
        >Submit
        </Button>
      </section>
      <Card
        id="main-container"
        style={{
          animation: state.mainAnimation,
          display: (state.userID !== "") ? "block" : "none"
        }}>
        <Card.Body>
          <article
            id="text-area-container">
            <section id="text-area">
              {[...state.justified.map(paragraph => (
                <div
                  className="paragraph"
                  key={uuidv4()}
                  style={{ display: (state.textArea) ? "none" : "block" }}
                  value={paragraph}>
                  {[...paragraph.map(line => (
                    <p
                      className="text"
                      key={uuidv4()}
                      style={{ width: (line === paragraph[paragraph.length - 1]) ? `${line.length * 1.25}%` : "" }}
                      value={line}>
                      {line}
                    </p>
                  ))]}
                </div>
              ))]}
              <Form>
                <Form.Control
                  as="textarea"
                  maxLength="10000"
                  rows="auto"
                  placeholder="Insert text here..."
                  className="textArea"
                  id="textArea"
                  style={{ display: (state.textArea) ? "block" : "none" }}
                  value={state.textValue}
                  onChange={(e) => changeInputHandler(e)} />
              </Form>
            </section>
          </article>
          <div id="controls">
            <Button
              style={{ display: (state.textArea) ? "block" : "none" }}
              variant="info"
              onClick={() => setState(prevState => { return { ...prevState, showMax: (state.showMax) ? false : true } })}
            >{(state.showMax) ? 'Max length : 10.000' : `Word Count: ${state.textValue.length}`}
            </Button>
            <Button variant="danger"
              onClick={() => setState(prevState => { return { ...prevState, textValue: '', justified: [], textArea: true } })}>Clear
          </Button>
            <Button
              variant="warning"
              onClick={justify}
              style={{ display: (state.textArea) ? "block" : "none" }}
            >Justify
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div >
  );
}

export default App;
