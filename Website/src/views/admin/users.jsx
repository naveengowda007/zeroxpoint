// Chakra imports
import { Box } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import queryString from 'query-string';

// Custom components
import { hpost, scrollTop } from "res";
import UserScreen from "./components/UserScreen";
import PageNumberCount from "./components/PageNumberCount";

// Order List components
import UsersTable from "views/admin/components/UsersTable";
import { UserColumnsData } from "views/admin/ColumnsData";

// Assets

export default function Users() {
	const location = useLocation();

	// states
	const [IsLoading, setIsLoading] = useState(true)
	const [CurId, setCurId] = useState()
	const [UsersData, setUsersData] = useState([])
	const [totalPages, setTotalPages] = useState(1)
	const [CurrentPage, setCurrentPage] = useState(1)

	useEffect(() => {
		const parsed = queryString.parse(location.search);
		if (parsed?.id) {
			setCurId(parsed?.id)
			setIsLoading("id")
		}
		else {
			setIsLoading("all")
		}
	}, [location, CurId]);

	useEffect(() => {
		scrollTop()
		getUsers()
	}, [CurrentPage])


	function getUsers() {
		hpost(`/getUsers?page=${CurrentPage}`, {}, true)
			.then(res => {
				// console.log(res);
				setUsersData(res.users)
				setTotalPages(res.totalPages)
			})
			.catch(err => console.log(err))
	}

	function MainComponent() {
		return <>
			<UsersTable
				columnsData={UserColumnsData}
				tableData={UsersData}
				CurrentPage={CurrentPage - 1}
			/>
			<PageNumberCount CurrentPage={CurrentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} />
		</>
	}

	return (
		<Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
			{!IsLoading ? null : IsLoading === "id" ? <UserScreen key={CurId} /> : <MainComponent />}
		</Box>
	);
}
