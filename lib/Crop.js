'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var Crop = (function (_Component) {
	_inherits(Crop, _Component);

	function Crop() {
		_classCallCheck(this, Crop);

		_get(Object.getPrototypeOf(Crop.prototype), 'constructor', this).call(this);
		this.state = {
			drag: null,
			image: null,
			pinch: null
		};
		this.listeners = {
			start: null,
			move: null,
			end: null
		};
	}

	_createClass(Crop, [{
		key: 'updateZoom',
		value: function updateZoom() {

			var factor = this.refs.zoom.value;

			var image = this.state.image;

			image.drawWidth = image.width * factor;
			image.drawHeight = image.height * factor;
			image.zoom = Math.abs(factor);
			image.boundary = {
				x: this.props.width - image.drawWidth,
				y: this.props.height - image.drawHeight
			};

			if (image.x + image.drawWidth < this.props.width) {
				image.x = this.props.width - image.drawWidth;
			}

			if (image.y + image.drawHeight < this.props.height) {
				image.y = this.props.height - image.drawHeight;
			}

			this.setState({ image: image });
		}
	}, {
		key: 'prepareImage',
		value: function prepareImage() {
			var _props = this.props;
			var width = _props.width;
			var height = _props.height;
			var image = _props.image;

			var newWidth = undefined;
			var newHeight = undefined;

			if (image.width > image.height) {
				newWidth = image.width * height / image.height;
				newHeight = height;
			} else {
				newHeight = image.height * width / image.width;
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
	}, {
		key: 'componentDidUpdate',
		value: function componentDidUpdate() {
			var canvas = this.refs.canvas;
			var image = this.state.image;

			var context = canvas.getContext('2d');

			context.clearRect(0, 0, this.props.width, this.props.height);
			context.drawImage(image.source, image.x, image.y, image.drawWidth, image.drawHeight);
		}
	}, {
		key: '_distance',
		value: function _distance(e) {
			var A = { x: e.touches[0].clientX, y: e.touches[0].clientY };
			var B = { x: e.touches[1].clientX, y: e.touches[1].clientY };

			return Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
		}
	}, {
		key: '_eventCoordinates',
		value: function _eventCoordinates(e) {
			return e.touches ? e.touches[0] : e;
		}
	}, {
		key: 'dragStart',
		value: function dragStart(e) {
			e.preventDefault();

			if (e.touches && e.touches.length > 2) return;

			var coordinates = this._eventCoordinates(e);

			if (e.touches && e.touches.length == 2) {
				var _drag = {
					pinch: {
						max: this.props.width * Math.sqrt(2),
						start: this._distance(e),
						zoom: this.state.image.zoom
					}
				};
				return this.setState({ drag: _drag });
			}

			var drag = {
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
			};

			this.setState({ drag: drag });
		}
	}, {
		key: 'dragMove',
		value: function dragMove(e) {

			if (!this.state.drag) return;

			e.preventDefault();

			if (this.state.drag.pinch) {
				var _state$drag$pinch = this.state.drag.pinch;
				var max = _state$drag$pinch.max;
				var start = _state$drag$pinch.start;
				var zoom = _state$drag$pinch.zoom;

				var distance = this._distance(e);

				var difference = distance - start;

				var direction = difference < 0 ? -1 : 1;

				var factor = Math.abs(difference) / max * 2;

				var newZoom = zoom + factor * direction;

				newZoom = newZoom < 1 ? 1 : newZoom;
				newZoom = newZoom > this.props.zoom ? this.props.zoom : newZoom;

				this.refs.zoom.value = parseFloat(newZoom).toFixed(2);

				this.updateZoom();
			}

			var coordinates = this._eventCoordinates(e);

			var _state = this.state;
			var drag = _state.drag;
			var image = _state.image;

			var diff = {
				x: drag.start.mouse.x - coordinates.clientX,
				y: drag.start.mouse.y - coordinates.clientY
			};

			var x = drag.start.image.x - diff.x;
			var y = drag.start.image.y - diff.y;

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

			this.setState({ image: image });
		}
	}, {
		key: 'dragEnd',
		value: function dragEnd(e) {
			if (!this.state.drag) return;

			e.preventDefault();

			this.setState({ drag: null });
		}
	}, {
		key: 'dragNoSelect',
		value: function dragNoSelect(e) {
			if (!this.state.drag) return;

			e.preventDefault();
		}
	}, {
		key: 'componentWillReceiveProps',
		value: function componentWillReceiveProps(newProps) {
			if (newProps.image !== this.props.image) {
				this.prepareImage();
			}
		}
	}, {
		key: 'componentDidMount',
		value: function componentDidMount() {
			var _this = this;

			this.prepareImage();

			this.listeners = {
				move: function move(e) {
					return _this.dragMove(e);
				},
				start: function start(e) {
					return _this.dragStart(e);
				},
				end: function end(e) {
					return _this.dragEnd(e);
				},
				select: function select(e) {
					return _this.dragNoSelect(e);
				}
			};

			window.addEventListener('mousemove', this.listeners.move);
			window.addEventListener('mouseup', this.listeners.end);
			window.addEventListener('touchmove', this.listeners.move);
			window.addEventListener('touchend', this.listeners.end);
			this.refs.canvas.addEventListener('mousedown', this.listeners.start);
			this.refs.canvas.addEventListener('touchstart', this.listeners.start);
			document.onselectstart = this.listeners.select;
		}
	}, {
		key: 'componentWillUnmount',
		value: function componentWillUnmount() {
			window.removeEventListener('touchmove', this.listeners.move);
			window.removeEventListener('touchend', this.listeners.end);
			window.removeEventListener('mousemove', this.listeners.move);
			window.removeEventListener('mouseup', this.listeners.end);
			this.refs.canvas.removeEventListener('mousedown', this.listeners.start);
			this.refs.canvas.removeEventListener('touchstart', this.listeners.start);
		}
	}, {
		key: 'getDataURL',
		value: function getDataURL() {
			return this.refs.canvas.toDataURL();
		}
	}, {
		key: 'render',
		value: function render() {

			var style = _extends({}, this.props.style || {}, { cursor: 'move' });

			var zoom = null;

			if (this.props.zoom) {
				zoom = _react2['default'].createElement(
					'div',
					null,
					_react2['default'].createElement('input', {
						type: 'range',
						ref: 'zoom',
						onChange: this.updateZoom.bind(this),
						onMouseMove: this.updateZoom.bind(this),
						//onMouseUp={this.updateZoom.bind(this)}
						style: { width: this.props.width, cursor: 'pointer' },
						min: '1',
						max: this.props.zoom,
						step: '0.01',
						defaultValue: '1'
					})
				);
			}

			return _react2['default'].createElement(
				'div',
				null,
				_react2['default'].createElement(
					'div',
					null,
					_react2['default'].createElement('canvas', { style: style, width: this.props.width, height: this.props.height, ref: 'canvas' })
				),
				zoom
			);
		}
	}]);

	return Crop;
})(_react.Component);

Crop.propTypes = {
	width: _react2['default'].PropTypes.number.isRequired,
	height: _react2['default'].PropTypes.number.isRequired,
	zoom: _react2['default'].PropTypes.number,
	image: _react2['default'].PropTypes.object.isRequired,
	style: _react2['default'].PropTypes.object
};

exports['default'] = Crop;
module.exports = exports['default'];