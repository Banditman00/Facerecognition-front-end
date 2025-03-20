import React, { Component } from 'react';
import ParticlesBg from 'particles-bg'
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Navigation from './components/Navigation/Navigation';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import './App.css';


const initialState = {
    input: '',
    imageUrl: '',
    box: {},
    route: 'home',
    isSignedIn: false,
    user: {
      id: '',
      name: '',
      email: '',
      entries: 0,
      joined: ''
    }
  }

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'home',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    }
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions;
    const box = clarifaiFace.map(element => {
      const bounding_box = element.region_info.bounding_box;
      const image = document.getElementById('inputimage');
      const width = Number(image.width);
      const height = Number(image.height);
      return {
        leftCol: bounding_box.left_col * width,
        topRow: bounding_box.top_row * height,
        rightCol: width - (bounding_box.right_col * width),
        bottomRow: height - (bounding_box.bottom_row * height)
      }
    });
    return box
  }

  displayFaceBox = (box) => {
    this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
    fetch("https://salty-ridge-20571-e329efeb67e7.herokuapp.com/imageurl", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: this.state.input,
      }),
    })
      .then((response) => {
        if (response.status === 500) {
          throw new Error(
            "Whoops! Sorry, we are currently unable to connect to the API."
          );
        }
        return response.json();
      })
      .then((result) => {
        const parsedResult = JSON.parse(result);
            console.log('result',parsedResult);
            const regions = parsedResult.outputs[0].data.regions;
            this.displayFaceBox(this.calculateFaceLocation(parsedResult));
            if (result) {
                      fetch('https://salty-ridge-20571-e329efeb67e7.herokuapp.com/image', {
                        method: 'put',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                          id: this.state.user.id
                        })
                      })
                        .then(response => response.json())
                        .then(count => {
                          this.setState(Object.assign(this.state.user, { entries: count}))
                        })
            
                    }
    
            regions.forEach(region => {
                // Accessing and rounding the bounding box values
                const boundingBox = region.region_info.bounding_box;
                const topRow = boundingBox.top_row.toFixed(3);
                const leftCol = boundingBox.left_col.toFixed(3);
                const bottomRow = boundingBox.bottom_row.toFixed(3);
                const rightCol = boundingBox.right_col.toFixed(3);
                
                region.data.concepts.forEach(concept => {
                    // Accessing and rounding the concept value
                    const name = concept.name;
                    const value = concept.value.toFixed(4);
                    console.log(`${name}: ${value} BBox: ${topRow}, ${leftCol}, ${bottomRow}, ${rightCol}`);
                });
            });
    
        })
        .catch(error => console.log('error', error));
      }

      onRouteChange = (route) => {
        if (route === 'signout') {
          this.setState(initialState);
        } else if (route === 'home') {
          this.setState({ isSignedIn: true });
        }
        this.setState({ route: route });
      }
    
    
      render() {
        const { isSignedIn, imageUrl, route, box } = this.state;
        return (
          <div className="App">
            <ParticlesBg type='cobweb' bg={true} num={200} color="#fffaf9" />
            <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
            {route === 'home'
              ? <div>
                <Logo />
                <Rank name={this.state.user.name} entries={this.state.user.entries} />
                <ImageLinkForm
                  onInputChange={this.onInputChange}
                  onButtonSubmit={this.onButtonSubmit}
                />
                <FaceRecognition box={box} imageUrl={imageUrl} />
              </div>
              : (
                route === 'signin' || route === 'signout'
                  ? <Signin onRouteChange={this.onRouteChange} loadUser={this.loadUser} />
                  : <Register onRouteChange={this.onRouteChange} loadUser={this.loadUser} />
              )
            }
          </div>
        );
      }
    }

export default App;
