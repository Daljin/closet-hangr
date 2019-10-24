//General
import * as FileSystem from 'expo-file-system';
// AWS S3
import {Storage} from 'aws-amplify'
// AWS DynanamoDB
import API, { graphqlOperation } from '@aws-amplify/api'
import * as queries from './src/graphql/queries';
import * as mutations from './src/graphql/mutations';
import * as subscriptions from './src/graphql/subscriptions';
//Cognito
import Auth from '@aws-amplify/auth'
//Fast image
import FastImage from 'react-native-fast-image'


/*
  _   _ _____ _     ____  _____ ____    _____ _   _ _   _  ____ _____ ___ ___  _   _ ____  
 | | | | ____| |   |  _ \| ____|  _ \  |  ___| | | | \ | |/ ___|_   _|_ _/ _ \| \ | / ___| 
 | |_| |  _| | |   | |_) |  _| | |_) | | |_  | | | |  \| | |     | |  | | | | |  \| \___ \ 
 |  _  | |___| |___|  __/| |___|  _ <  |  _| | |_| | |\  | |___  | |  | | |_| | |\  |___) |
 |_| |_|_____|_____|_|   |_____|_| \_\ |_|    \___/|_| \_|\____| |_| |___\___/|_| \_|____/ 
                                                                                           
*/

 /**
  * Creates and returns a promise that resolves to the URI of the new PNG image made if the URI of the iamge given is not of a PNG
  */ 
 export const createPNG = async(
	/** The URI of an image that is either already or copied as a PNG */
	uri,
) => {
  let splitURI = uri.split(".")
  let fileFormat = splitURI[splitURI.length-1]
  let pngURI = uri
  if(fileFormat!="png")
  {
	  pngURI = uri.substring(0,uri.lastIndexOf(".")) + ".png"
	  await FileSystem.copyAsync({from: uri, to: pngURI})
  }
  return pngURI
}

/**
 * Changes the image at the image URI such that the background is removed
 */
export const removeBackground = async (
  /** The URI of the image to remove the background of */
  uri
) => {
  //Reading the file in base64 into a string for input to the api
  let fileB64 = await FileSystem.readAsStringAsync(uri,{encoding: FileSystem.EncodingType.Base64})
  
  //Background removal API
  let response = await fetch('https://api.remove.bg/v1.0/removebg', {  
	  method: 'POST',
	  headers: {
		  'X-Api-Key': 'ddmywF3gfzCLF3ebfmX1X9qD',
		  Accept: 'application/json',
		  'Content-Type': 'application/json',
	  },
	  body: JSON.stringify({
		  image_file_b64: fileB64,
		  size: 'preview',
		  add_shadow: true,
	  })
  })
  let responseJson = await response.json()
  let newImageB64 = responseJson.data.result_b64
  await FileSystem.writeAsStringAsync(uri, newImageB64,{encoding: FileSystem.EncodingType.Base64})
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/*
  ______   ___   _    _    __  __  ___    ____  ____    _____ _   _ _   _  ____ _____ ___ ___  _   _ ____  
 |  _ \ \ / / \ | |  / \  |  \/  |/ _ \  |  _ \| __ )  |  ___| | | | \ | |/ ___|_   _|_ _/ _ \| \ | / ___| 
 | | | \ V /|  \| | / _ \ | |\/| | | | | | | | |  _ \  | |_  | | | |  \| | |     | |  | | | | |  \| \___ \ 
 | |_| || | | |\  |/ ___ \| |  | | |_| | | |_| | |_) | |  _| | |_| | |\  | |___  | |  | | |_| | |\  |___) |
 |____/ |_| |_| \_/_/   \_\_|  |_|\___/  |____/|____/  |_|    \___/|_| \_|\____| |_| |___\___/|_| \_|____/ 
                                                                                                           
*/

/**
 * Creates a new user in the database
 */
export const createNewUser = async (
   u_name = ""
) => {
   //Create the object with the parameters for mutation
   const information = {
		id: u_name,
      username: u_name
   }

   //Mutate the database
   try {
		const response = await API.graphql(graphqlOperation(mutations.createUser, {input: information}))
		console.log('New user created')
   } catch (err) {console.log('ERROR: Error creating a new user in Dynamo DB', err)}
}

/*
* Creates a new piece of clothing
* Returns the id of the new clothing
*/
export const createNewClothing = async (
	u_name,
	imageKey,
) => {
	const information = {
		key: imageKey,
		clothingUserId: u_name,
	}

	try {
		const response = await API.graphql(graphqlOperation(mutations.createClothing, {input: information}))
		console.log('New clothing created')
	} catch (err) {console.log('ERROR: Error creating a new clothing in Dynamo DB', err)}
}

/*
	Take a URI and puts that image in the database
*/
export const addImageToDatabase = async (
	uri
) => {
	let key = ""
	//Convert the image to a png
	try {
		uri = await createPNG(uri)
		console.log('While adding image to database, successfully created a png')
	} catch (err) {console.log('ERROR: While adding image to database, error creating png', err)}
	//Remove the background from the image
	//try {
	//	await removeBackground(uri)
	//	console.log('While adding image to database, successfully removed background')
	//} catch (err) {console.log('ERROR: While adding image to databaes, error removing background', err)}
	//Add to S3
	try {
		let response = await storeFileInS3(uri)
		console.log('While adding image to database, successfully stored image in S3')
		key = response.key
	} catch (err) {console.log('ERROR: While adding image to database, error storing in S3'), err}
	// TODO: Classify the image

	// Insert the clothing in the database and connect to the current user
	let user = await Auth.currentUserInfo()
	try {
		await createNewClothing(user.username, key)
		console.log('While adding image to database, successfully created clothing')
	} catch (err) {console.log('ERROR: While adding image to databaes, error creating image in database',err)}
}

export const retrieveAllClothing = async (
	u_name
) => {
	const information = {
		id: u_name
	}

	try {
		const response = await API.graphql(graphqlOperation(queries.getUser, {id: u_name}))
		console.log("Clothing successfully received")

		//TODO Preloading

		if(response.data.getUser.clothing.items.length > 0) {	
			let clothing = []
			//Create datastructure for preloading
			for(let i = 0; i < response.data.getUser.clothing.items.length; i++) {
				let item = {
					id: response.data.getUser.clothing.items[i].id,
					uri: await Storage.get(response.data.getUser.clothing.items[i].key,{level: 'private',})
				}
				clothing.push(item)
			}
			return clothing
		}
	} catch (err) {console.log("ERROR: Error when retrieving clothing", err)}
}

 /*
   ____ _____   _____ _   _ _   _  ____ _____ ___ ___  _   _ ____  
  / ___|___ /  |  ___| | | | \ | |/ ___|_   _|_ _/ _ \| \ | / ___| 
  \___ \ |_ \  | |_  | | | |  \| | |     | |  | | | | |  \| \___ \ 
   ___) |__) | |  _| | |_| | |\  | |___  | |  | | |_| | |\  |___) |
  |____/____/  |_|    \___/|_| \_|\____| |_| |___\___/|_| \_|____/ 
                                                                   
 */

/**
 * Stores the file in the given URI in S3 with the specified level of permission
 */
export const storeFileInS3 = async (
	fileUri,
	awsKey = null,
	access = "private"
 ) => {
	const blob = await new Promise((resolve, reject) => {
	  const xhr = new XMLHttpRequest();
	  xhr.onload = function() {
		 resolve(xhr.response);
	  };
	  xhr.onerror = function() {
		reject(new TypeError("Network request failed"));
	  };
	  xhr.responseType = "blob";
	  xhr.open("GET", fileUri, true);
	  xhr.send(null);
	});
	const { name, type } = blob._data;
	const options = {
	  level: access,
	  contentType: type,
	};
	const key = awsKey || name;
	try {
	  const result = await Storage.put(key, blob, options);
	  return {
		 access,
		 key: result.key
	  };
	} catch (err) {
	  throw err;
	}
 }

/*
   ____ ___   ____ _   _ ___ _____ ___    _____ _   _ _   _  ____ _____ ___ ___  _   _ ____  
  / ___/ _ \ / ___| \ | |_ _|_   _/ _ \  |  ___| | | | \ | |/ ___|_   _|_ _/ _ \| \ | / ___| 
 | |  | | | | |  _|  \| || |  | || | | | | |_  | | | |  \| | |     | |  | | | | |  \| \___ \ 
 | |__| |_| | |_| | |\  || |  | || |_| | |  _| | |_| | |\  | |___  | |  | | |_| | |\  |___) |
  \____\___/ \____|_| \_|___| |_| \___/  |_|    \___/|_| \_|\____| |_| |___\___/|_| \_|____/ 
                                                                                             
*/


/**
 * Signs up the user through AWS cognito 
 */
export const signUp = async (
	email,
	username,
	password,
) => {
	console.log("attempting to sign up")

	try {
		// Sign up
		await Auth.signUp({username, password, attributes: {email}})
		console.log('Successfully signed up')
	} catch (err) {console.log('ERROR: Error signing up: ', err)}

	//Adding the user to the database
	createNewUser(username)
}

/**
 * Confirms the sign up of the user through AWS cognito
 */
export const confirmSignUp = async (
	username, 
	authentificationCode,
) => {
	try {
		await Auth.confirmSignUp (username, authentificationCode)
		console.log('User sign up successfully confirmed')
	} catch (err) {console.log('ERROR: Error confirming sign up: ', err)}
}

/**
 * Signs the user in through AWS Cognito
 */
export const signIn = async (
	username,
	password
) => {
	try {
		await Auth.signIn(username, password)
		console.log('User sign in successful')
	} catch (err) {console.log('ERROR: Error signing in: ', err)}
}

/**
 * Gets the info of the current user
 * Returns an user object
 */
export const getCurrentUserInfo = async () => {
	try {
		let user = await Auth.currentUserInfo()
		return user
	} catch (err) {console.log('Current user info error: ', err)}
}

/*
 * Signs the current user out
*/
export const signOut = async() => {
	try {
		await Auth.signOut()
		console.log('Use successfully signed out')
	} catch (err) { console.log('ERROR: error signing the current user out', err)}
}

