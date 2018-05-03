import React from 'react';
import Crop from './../src/Crop';
import b64Img from './b64Img';

describe('Crop', () => {
	let props;

	beforeEach(() => {
		props = {
			width: 500,
			height: 500,
			image: {
				name: 'testImg.jpg',
				source: b64Img.src,
				width: 500,
				height: 500,
			},
		};
	});
	it('renders without exploding', () => {
		const wrapper = mount(<Crop {...props} />);
		expect(wrapper).toHaveLength(1);
	});
});
