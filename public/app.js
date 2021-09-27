document.addEventListener("DOMContentLoaded", event => {

	const app = firebase.app();
	const db = firebase.firestore();




	const myPost = db.collection( 'posts' ).doc( 'firstpost' );
	/* //one-time read, booring:
	myPost.get().then( doc => {
		const data = doc.data();
		console.log( "myPost", data );

		document.write( data.title + '<br />');asc
		document.write( data.createdAt );
	});*/
	//listen to data-changes:
	myPost.onSnapshot( doc => {
		const data = doc.data();
		console.log( "myPost", data );

		$("#title").text( data.title );

	});




	const productsRef = db.collection( 'products' );
	//const query = productsRef.where("price", ">=", 10 );
	//const query = productsRef.where("price", "==", 10 );
	//const query = productsRef.where("price", ">", 10 ).orderBy('price', "desc").limit(2);
	const query = productsRef.where("price", ">", 10 ).orderBy('price', "desc");
	//const query = productsRef.orderBy('price', "desc");

	/* //one-time read, booring:
	query.get().then(products => {
		products.forEach( doc => {
			data = doc.data();
			$( "#products" ).append( $("<li>").text(`${data.name} at $${data.price}`));
		});
	});
	*/
	query.onSnapshot(products => {
		$( "#products" ).empty()
		products.forEach( doc => {
			data = doc.data();
			$( "#products" ).append( $("<li>").text(`${data.name} at $${data.price}`));
		});
	});

	$("#addProduct").on( "click", addProduct );

});
function addProduct() {
		console.log( "addProduct -> ");
	/*
	import { doc, setDoc } from "firebase/firestore";

	const db = firebase.firestore();
	console.log( "addProduct: B" );
	await setDoc(doc(db, "products", "LA"), {
		name: $( "#name" ).val(),
		price: $( "#price" ).val()
	});
	*/

	const db = firebase.firestore();
	db.collection( "products").doc( $( "#name" ).val() ).set({
		name: $( "#name" ).val(),
		price: Number( $( "#price" ).val() )
	}).then( () => {
		console.log( "addProduct: Done!" );
	}).catch(console.error);


}

function updatePost(e){
	const db = firebase.firestore();
	const myPost = db.collection( 'posts' ).doc( 'firstpost' );
	myPost.update({title: e.target.value });

}

function googleLogin() {
	const provider = new firebase.auth.GoogleAuthProvider();

	firebase.auth().signInWithPopup( provider )
		.then( result => {
			const user = result.user;
			$( "#welcomeUser" ).text( `Hello ${user.displayName}` );
			$( "#googleLoginButton" ).remove();
			console.log( "Logged in user:", user );
			/*
			console.log( "auth", user.auth );
			console.log( "displayName", user.displayName );
			console.log( "email", user.email );
			console.log( "emailVerified", user.emailVerified );
			console.log( "isAnonymous", user.isAnonymous );
			console.log( "metadata", user.metadata );
			console.log( "phoneNumber", user.phoneNumber );
			console.log( "photoURL", user.photoURL );
			console.log( "providerData", user.providerData );
			console.log( "providerId", user.providerId );
			console.log( "refreshToken", user.refreshToken );
			console.log( "tenantId", user.tenantId );
			*/
		})
		.catch(console.log);
}

function uploadFile(files) {
    const storageRef = firebase.storage().ref();
    const imgRef = storageRef.child('horse2.jpg');

    const file = files.item(0);

    const task = imgRef.put(file)

    task.on('state_changed',
      (snapshot) => {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log('Upload is paused');
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log('Upload is running');
            break;
        }
      },
      (error) => {
        // Handle unsuccessful uploads
      	console.error( error );
      },
      () => {
        // Handle successful uploads on complete
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        task.snapshot.ref.getDownloadURL().then((downloadURL) => {
          console.log('ORG File available at', downloadURL);
					$( "#imgUpload").attr( "src", downloadURL);
        });
      }
    );


}
