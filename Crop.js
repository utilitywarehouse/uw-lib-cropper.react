import React, {Component} from 'react';

class Crop extends Component {
	constructor() {
		super();
		this.state = {
			drag: null,
			image: null
		}
		this.listeners = {
			start: null,
			move: null,
			end: null
		}
	}

	updateZoom = () => {
		const factor = this.refs.zoom.value;
		const {image} = this.state;

		image.drawWidth = image.width * factor;
		image.drawHeight = image.height * factor;
		image.zoom = factor;
		image.boundary = {
			x: this.props.width - image.drawWidth,
			y: this.props.height - image.drawHeight
		}

		if (image.x + image.drawWidth < this.props.width) {
			image.x = this.props.width - image.drawWidth;
		}

		if (image.y + image.drawHeight < this.props.height) {
			image.y = this.props.height - image.drawHeight;
		}

		this.setState({image});
	}

	prepareImage() {

		const {width, height, image} = this.props;

		let newWidth;
		let newHeight;

		if (image.width > image.height) {
			newWidth = (image.width * height) / image.height;
			newHeight = height;
		} else {
			newHeight = (image.height * width) / image.width;
			newWidth = width;
		}

		this.setState({
			image: {
				source: this.props.image,
				width: newWidth, height: newHeight,
				x: 0, y: 0,
				zoom: 1,
				drawWidth: newWidth, drawHeight: newHeight,
				boundary: {
					x: this.props.width - newWidth,
					y: this.props.height - newHeight
				}
			},
			drag: null
		});

		this.refs.zoom.value = 1;
	}

	componentDidUpdate() {
		const {canvas} = this.refs;

		const {image} = this.state;

		canvas.getContext('2d').drawImage(
			image.source,
			image.x,
			image.y,
			image.drawWidth,
			image.drawHeight
		)

	}

	dragStart(e) {
		const drag = {
			start: {
				mouse: {
					x: e.clientX,
					y: e.clientY
				},
				image: {
					x: this.state.image.x,
					y: this.state.image.y
				}
			}
		}

		this.setState({drag});
	}

	dragMove(e) {
		if (!this.state.drag) return;

		const {drag, image} = this.state;

		const diff = {
			x: drag.start.mouse.x - e.clientX,
			y: drag.start.mouse.y - e.clientY
		}


		let x = drag.start.image.x - diff.x;
		let y = drag.start.image.y - diff.y;

		if (x < image.boundary.x) {
			x = image.boundary.x;
		}

		if (y < image.boundary.y) {
			y = image.boundary.y;
		}

		if (x > 0) {
			x = 0;
		}

		if (y > 0) {
			y = 0;
		}

		image.x = x;
		image.y = y;

		this.setState({image});

	}

	dragEnd() {
		if (!this.state.drag) return;

		this.setState({drag: null});
	}

	componentWillReceiveProps(newProps) {
		if (newProps.image !== this.props.image) {
			this.prepareImage();
		}
	}

	componentDidMount() {
		this.prepareImage();

		this.listeners = {
			move: (e) => this.dragMove(e),
			start: (e) => this.dragStart(e),
			end: (e) => this.dragEnd(e)
		};

		window.addEventListener('mousemove', this.listeners.move);
		window.addEventListener('mouseup', this.listeners.end);
		this.refs.canvas.addEventListener('mousedown', this.listeners.start);

	}

	componentWillUnmount() {
		window.removeEventListener('mousemove', this.listeners.move);
		window.removeEventListener('mouseup', this.listeners.end);
		this.refs.canvas.removeEventListener('mousedown', this.listeners.start);
	}

	getDataURL() {
		return this.refs.canvas.toDataURL();
	}

	render() {

		let zoom = null;

		if (this.props.zoom) {
			zoom = (<div><input
				type="range"
				ref="zoom"
				onChange={this.updateZoom}
				style={{width: this.props.width}}
				min="1"
				max={this.props.zoom}
				step="0.01"
				defaultValue="1"
			/></div>);
		}

		return (
			<div>
				<div>
					<canvas style={{cursor: 'move'}} width={this.props.width} height={this.props.height} ref="canvas"/>
				</div>
				{zoom}
			</div>
		)
	}
}


Crop.propTypes = {
	width: React.PropTypes.number.isRequired,
	height: React.PropTypes.number.isRequired,
	zoom: React.PropTypes.number,
	image: React.PropTypes.objectOf(Image).isRequired
};


export default Crop;

