// Chakra imports
import { Box } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import queryString from 'query-string';

// Custom components
import { hpost, scrollTop } from "res";
import VendorScreen from "./components/VendorScreen";
import PageNumberCount from "./components/PageNumberCount";

// Order List components
import { UserColumnsData } from "views/admin/ColumnsData";
import VendorsTable from "views/admin/components/VendorsTable";

// Assets

export default function Vendors() {
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
	}, [location]);

	useEffect(() => {
		scrollTop()
		getVendors()
	}, [CurrentPage])


	function getVendors() {
		hpost(`/getVendors?page=${CurrentPage}`, {}, true)
			.then(res => {
				// console.log(res);
				setUsersData(res.vendors)
				setTotalPages(res.totalPages)
			})
			.catch(err => console.log(err))
	}

	function MainComponent() {
		return <>
			<VendorsTable
				columnsData={UserColumnsData}
				tableData={UsersData}
				CurrentPage={CurrentPage - 1}
			/>
			<PageNumberCount CurrentPage={CurrentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} />
		</>
	}

	return (
		<Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
			{!IsLoading ? null : IsLoading === "id" ? <VendorScreen key={CurId} /> : <MainComponent />}
		</Box>
	);
}
