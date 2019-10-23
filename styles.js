import {StyleSheet} from 'react-native';

const COLOR_PRIMARY = '#00bf7f';
const COLOR_SECONDARY = '#1da4c2';
const COLOR_TEXT = "#080808"
const FONT_NORMAL = 'Avenir';
const FONT_BOLD = '';
const BORDER_RADIUS = 25;
 
 export default styles = StyleSheet.create({
	container: {
		 flex: 1,
		 backgroundColor: '#FFFFFF',
		 alignItems: 'center',
		 justifyContent: 'center',
	  },
	  logoContainer: {
		 alignItems: 'center',
		 marginBottom: 40,
	  },
	  logo: {
		 height: 100,
		 width: 140,
	  },
	  menuIcon: {
			height: 30, 
			width: 30,
			marginTop: 20, 
			marginLeft: 10,
	  },
	  heartIcon: {
			height: 30, 
			width: 30, 
			marginTop: 20,
			marginRight: 10, 
	  },
	  title: {
		 color: COLOR_TEXT,
		 fontFamily: FONT_NORMAL,
		 fontSize: 36,
		 fontWeight: 'bold',
		 marginTop: 20,
		 width: 300,
		 justifyContent: 'center',
		 textAlign: 'center',
	  },
	  fieldContainer: { 
		 margin: 2,
		 padding: 12,
		 margin: 10,
		 height: 50,
		 width: 250,
		 textAlign: 'left',
		 alignItems: 'center',
		 justifyContent: 'center',
		 backgroundColor: COLOR_SECONDARY,
		 borderRadius: BORDER_RADIUS
	  },
	  regularText: {
		 fontFamily: FONT_NORMAL,
		 fontSize: 14,
		 color: COLOR_TEXT,
	  },
	  inputText: {
		fontFamily: FONT_NORMAL,
		 fontSize: 18,
		 color: COLOR_TEXT,
		 padding: 1,
		 backgroundColor: COLOR_SECONDARY,
	  },
	  signUpButton: {
		backgroundColor: COLOR_PRIMARY,
		marginTop: 10,
		marginBottom: 10,
		padding: 10,
		borderRadius: BORDER_RADIUS,
		width: 125,
		alignItems: "center"
	  },
	  signInButton: {
		backgroundColor: COLOR_PRIMARY,
		marginTop: 10,
		marginBottom: 10,
		padding: 10,
		borderRadius: BORDER_RADIUS,
		width: 125,
		alignItems: "center"
	  }
 })
 
