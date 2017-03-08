import React, {Component} from 'react';

class Crop extends Component {
	constructor() {
		super();
		this.state = {
			drag: null,
			image: null,
			pinch: null
		}
		this.listeners = {
			start: null,
			move: null,
			end: null
		}
	}

	updateZoom() {

		const factor = this.refs.zoom.value;

		const {image} = this.state;

		image.drawWidth = image.width * factor;
		image.drawHeight = image.height * factor;
		image.zoom = Math.abs(factor);
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

	_distance(e) {
		const A = {x: e.touches[0].clientX, y: e.touches[0].clientY}
		const B = {x: e.touches[1].clientX, y: e.touches[1].clientY}

		return Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
	}

	_eventCoordinates(e) {
		return e.touches ? e.touches[0] : e;
	}

	dragStart(e) {
		e.preventDefault();

		if (e.touches && e.touches.length > 2) return;

		const coordinates = this._eventCoordinates(e);

		if (e.touches && e.touches.length == 2) {
			const drag = {
				pinch: {
					max: this.props.width * Math.sqrt(2),
					start: this._distance(e),
					zoom: this.state.image.zoom
				}
			};
			return this.setState({drag})
		}

		const drag = {
			start: {
				mouse: {
					x: coordinates.clientX,
					y: coordinates.clientY
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

		e.preventDefault();

		if (this.state.drag.pinch) {

			const { max, start, zoom } = this.state.drag.pinch;

			const distance = this._distance(e);

			const difference = distance - start;

			const direction = difference < 0 ? -1 : 1;

			let factor = (Math.abs(difference) / max) * 2;

			let newZoom = zoom + (factor * direction);

			newZoom = newZoom < 1 ? 1 : newZoom;
			newZoom = newZoom > this.props.zoom ? this.props.zoom : newZoom;

			this.refs.zoom.value = parseFloat(newZoom).toFixed(2);

			this.updateZoom();

		}

		const coordinates = this._eventCoordinates(e);

		const {drag, image} = this.state;

		const diff = {
			x: drag.start.mouse.x - coordinates.clientX,
			y: drag.start.mouse.y - coordinates.clientY
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

	dragEnd(e) {
		if (!this.state.drag) return;

		e.preventDefault();

		this.setState({drag: null});
	}

	dragNoSelect(e) {
		if (!this.state.drag) return;

		e.preventDefault();
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
			end: (e) => this.dragEnd(e),
			select: (e) => this.dragNoSelect(e)
		};

		window.addEventListener('mousemove', this.listeners.move);
		window.addEventListener('mouseup', this.listeners.end);
		window.addEventListener('touchmove', this.listeners.move);
		window.addEventListener('touchend', this.listeners.end);
		this.refs.canvas.addEventListener('mousedown', this.listeners.start);
		this.refs.canvas.addEventListener('touchstart', this.listeners.start);
		document.onselectstart = this.listeners.select;

	}

	componentWillUnmount() {
		window.removeEventListener('touchmove', this.listeners.move);
		window.removeEventListener('touchend', this.listeners.end);
		window.removeEventListener('mousemove', this.listeners.move);
		window.removeEventListener('mouseup', this.listeners.end);
		this.refs.canvas.removeEventListener('mousedown', this.listeners.start);
		this.refs.canvas.removeEventListener('touchstart', this.listeners.start);
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
				onChange={this.updateZoom.bind(this)}
				onMouseMove={this.updateZoom.bind(this)}
				//onMouseUp={this.updateZoom.bind(this)}
				style={{width: this.props.width, cursor: 'pointer'}}
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
	image: React.PropTypes.object.isRequired
};


export default Crop;

