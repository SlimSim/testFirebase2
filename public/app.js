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
	const query = productsRef.where("price", ">", 10 ).orderBy('price', "desc").limit(2);

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



});

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
			document.write( `Hello ${user.displayName}` );
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
