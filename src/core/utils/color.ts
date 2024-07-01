export const generateRandomColor = () => {
	var randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);

	if (randomColor.length != 7) {
		randomColor = generateRandomColor();
	}

	return randomColor;
}