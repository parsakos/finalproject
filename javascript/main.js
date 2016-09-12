/* CURRENTLY IN: javascript/main.js */

// TODO: Grab info from localstorage and append to history & calendar page

var user = firebase.auth().currentUser;

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    app( user );
  } else {
    // No user is signed in.
    handleAuth();
  }
});

function handleAuth() {
	var provider = new firebase.auth.GoogleAuthProvider();
	provider.addScope('https://www.googleapis.com/auth/plus.login');

	firebase.auth().signInWithPopup(provider).then(function(result) {
	  // This gives you a Google Access Token. You can use it to access the Google API.
	  var token = result.credential.accessToken;
	  // The signed-in user info.
	  var user = result.user;

	  app( result.user );
	  // ...
	}).catch(function(error) {
	  // Handle Errors here.
	  var errorCode = error.code;
	  var errorMessage = error.message;
	  // The email of the user's account used.
	  var email = error.email;
	  // The firebase.auth.AuthCredential type that was used.
	  var credential = error.credential;
	  // ...

	  console.log( error )
	});
}


function app( user ) {
	// const email = user.email;
	const { uid } = user;

	const userRef = firebase.database().ref(`/users/${uid}`);

	$('.js-menu').on('click', function() {
		$('.ui.sidebar').sidebar('toggle');	
	});


	function setInfo() {
		const data = getStoredData().then((data) => {
			$('.js-store-workout').on('click', function( e ){
				e.preventDefault();

				storeWorkout(data);
			});
		});
	}


	function getInfo() {
		// to retrive
		const data = getStoredData().then((data) => {
			displayInfo( data );
		});

		// const datastr = window.localStorage.getItem('data');

		// if ( datastr ) {
		// 	const data = JSON.parse( datastr );

			
		// }

	}

	function displayInfo( data ) {

		const keys = Object.keys( data ); // this gives me an ARRAY containing all the dates that exist

		const $results = $('.js-results');

		for ( let i = 0; i < keys.length; i++ ) {
			const currentKey = keys[ i ];
			const currentDate = data[ currentKey ].reverse();

			$results.append($(`<h1 class="ui header dateFont">${currentKey}</h1>`));
			// alert();

			for (let i = 0; i < currentDate.length; i++) { 
				const { movement, reps, sets, weight } = currentDate[ i ];
				
					$results.append($(`<div class="ui segments"> 
					
						  <div class="ui segment">
						    <p class="movementFont">${movement}</p>
						  </div>
						  <div class="spacing ui blue segment">
						    <p>Sets: ${sets}</p>
						  </div>
						  <div class="spacing ui blue segment">
						    <p>Reps: ${reps}</p>
						  </div>
						  <div class="spacing ui blue segment">
						    <p>Weight: ${weight}</p>
						  </div>
						</div>
					
				</div>`))
			}
			
		}

	}

	function getStoredData() {
		return new Promise((resolve, reject) => {
			userRef.once('value', function(snapshot) {
				console.log( snapshot.val() );
				const datastr = snapshot.val();
				console.log('getStoredData: datastr = ', datastr );

				if ( datastr === null ) {
					resolve({});
				}

				resolve(datastr);
			});
		})
	}

	function storeWorkout(data){
		const dateToday = getTodaysDate();

		const currentMovement = validateSelection( $('#movement option:selected'), 'movement' );
		const currentSetNumber = validateSelection( $('#sets option:selected'), 'set number' );
		const currentRepsNumber = validateSelection( $('#reps option:selected'), 'rep number' );
		const currentWeight = validateSelection( $('#weight'), 'weight' );
		
		if ( currentMovement === false || currentSetNumber === false || currentRepsNumber === false || currentWeight === false ) {
			return;
		}



		if ( typeof data[ dateToday ] === "undefined" ) {
			data[ dateToday ] = [];	
		}
		
		data[ dateToday ].push({
			movement: currentMovement,
			sets: currentSetNumber,
			reps: currentRepsNumber,
			weight: currentWeight, 

		});

		userRef.set( data );

		$('.js-form').find('.field select, .field input').each(function() {
			if ( $( this ).is('input') ) {
				$( this ).val('');
			}
			else {
				$( this ).val('-1')
			}
			
		});
	}

	function validateSelection( $field, label ) {
		if ( $field.val() === "-1" || $field.val() === "" ) {
			alert(`Need to set a ${label}, bro`);
			return false;
		}

		return $field.val();
	}

	function getTodaysDate(){
		const today = new Date();
		const dd = today.getDate();
		const mm = today.getMonth() + 1; //January is 0!
		const yyyy = today.getFullYear();
		const dateAsString = `${mm}-${dd}-${yyyy}`;

		return dateAsString;
	}


	if ( $('.js-history-page').length > 0 ) {
		getInfo();
	}


	// If on the home page, call the function below
	if ( $('.js-home-page').length > 0 ) {
		setInfo();
	}
}	

