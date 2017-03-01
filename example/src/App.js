import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';

import Dropzone from 'react-dropzone';

import Crop from './Crop.js'

class App extends Component {
	constructor() {
		super();
		this.state = {}
	}

	reset = () => {
		this.setState({image: null, preview: null});
	}

	renderPreview() {
		if (this.state.preview) {
			return (
				<div>
					<img src={this.state.preview} /><br />
					<textarea style={{width: 300, height: 100}} defaultValue={this.state.preview} /><br />
					<button onClick={this.reset}>Reset</button>
				</div>
			)
		}
	}

	renderCrop() {
		if (this.state.image && !this.state.preview) {
			return (
				<div>
					<Crop
						width={300}
						height={300}
						zoom={5}
						image={this.state.image}
						ref="crop"
					/>
					<button onClick={this.dump}>Save</button>
					<span>&nbsp;&nbsp;&nbsp;</span>
					<button onClick={this.reset}>Cancel</button>
				</div>
			)
		}
	}

	renderDropzone() {
		if (!this.state.image && !this.state.preview) {
			return (
				<Dropzone
					onDrop={this.prepareImage}
					multiple={false}
					accept="image/*"
					style={{
						width: 300,
						backgroundColor: 'rgba(0, 0, 0, 0.1)',
						padding: 20,
						cursor: 'pointer'
					}}
				>
					<div>Try dropping your picture here, or click to select a file to upload.</div>
				</Dropzone>
			);
		}
	}

	dump = () => {
		this.setState({preview: this.refs.crop.getDataURL()});
	}

	prepareImage = (files) => {
		const source = files.pop().preview;

		const image = new Image();
		image.onload = () => {
			this.setState({image});
		}
		image.src = source;
	}

	render() {
		return (
			<div className="App">
				{this.renderPreview()}
				{this.renderCrop()}
				{this.renderDropzone()}
			</div>
		);
	}
}


export default App;
