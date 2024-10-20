import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, Switch, Redirect } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "theme/theme";
import { ThemeEditorProvider } from "@hypertheme-editor/chakra-ui";
import { ToastContainer } from 'react-toastify';
import { store } from "redux/store";
import { Provider, useDispatch } from "react-redux";
import { handleUserData } from "Utils/auth";
import { getData } from "res";

// Components
import LoginPage from "views/LoginPage";
import Layout from "views/Layout";
import UserLayout from "views/UserLayout";

import "assets/css/App.css";
import 'react-toastify/dist/ReactToastify.css';

function requireAuth(dispatch) {
	let isAuth = getData("token");
	let user = getData("userData");

	if (!isAuth || !user) return false;

	user = JSON.parse(user)
	user.jwt = isAuth

	handleUserData(user, dispatch)
	return user;
}

function MainComponent() {
	const dispatch = useDispatch()

	let user = requireAuth(dispatch)

	if (user) {
		return user?.type === "user" ? <UserLayout user={user} /> : <Layout user={user} />
	}
	else return <Redirect to="/auth" />;
}

ReactDOM.render(
	<Provider store={store}>
		<ChakraProvider theme={theme}>
			<React.StrictMode>
				<ThemeEditorProvider>
					<HashRouter>
						<Switch>
							<Route path={`/auth`} component={LoginPage} />
							<Route path={`/download`} component={LoginPage} />
							<Route path={`/admin`} component={MainComponent} />
							<Route path={`/user`} component={MainComponent} />

							<Redirect from='/' to='/auth' />
						</Switch>
					</HashRouter>
					<ToastContainer />
				</ThemeEditorProvider>
			</React.StrictMode>
		</ChakraProvider>
	</Provider>,

	document.getElementById("root")
);
