import { getData, setJWT_TOKEN, setUSER_ID, storeData } from "../res";

// Redux Actions
import { setUserData } from "../redux/UserData";

export function handleUserData(res, dispatch) {
	// console.log(res);
	checkToken(res)
	dispatch(setUserData(res));
	res["jwt"] = ""

	let userData = getData("userData")
	userData = JSON.parse(userData)

	if (userData) {
		storeData("userData", JSON.stringify({ ...userData, ...res }));
	}
	else {
		storeData("userData", JSON.stringify(res));
	}
}

export function checkToken(res) {
	if (res.jwt) {
		setJWT_TOKEN(res.jwt)
		storeData("token", res.jwt)
	}

	if (res.userid) {
		setUSER_ID(res.userid)
	}
}

export async function logout(history) {
	localStorage.clear()
	history.replace("/auth")
	window.location.reload()
}