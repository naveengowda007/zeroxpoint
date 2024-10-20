import React, { useEffect, useRef, useState } from "react";
import { Box } from "@chakra-ui/react";
import queryString from 'query-string';
import { useSelector } from "react-redux";
import { hpost, scrollTop } from "res";
import { useLocation } from "react-router-dom";
import PageNumberCount from "views/admin/components/PageNumberCount";

// Order List components
import OrderTable from "views/vendor/components/OrderTable";
import { VendorOrderColumnsData } from "./ColumnsData";
import OrderScreen from "./components/OrderScreen";

// Assets

export default function Orders() {
	const location = useLocation();
	const { LatestOrder } = useSelector((state) => state.Config);

	// states
	const [IsLoading, setIsLoading] = useState(true)
	const [CurId, setCurId] = useState()
	const [OrdersData, setOrdersData] = useState([])
	const [totalPages, setTotalPages] = useState(1)
	const [CurrentPage, setCurrentPage] = useState(1)

	const ScrollCountRef = useRef(true)

	useEffect(() => {
		const parsed = queryString.parse(location.search);
		if (parsed?.id) {
			setCurId(parsed?.id)
			setIsLoading("id")
			ScrollCountRef.current = true
		}
		else {
			setIsLoading("all")
			if (CurrentPage === 1) {
				if (IsLoading !== "id" && ScrollCountRef.current) {
					ScrollCountRef.current = false
					scrollTop()
				}
			} else scrollTop()
		}
	}, [location]);

	useEffect(() => {
		IsLoading !== "id" && getOrders()

		let intervalId = setInterval(() => getOrders(), 20000)
		return () => clearInterval(intervalId)
	}, [CurrentPage, IsLoading, LatestOrder])


	function getOrders() {
		hpost(`/getOrders4Vendor?page=${CurrentPage}`, {}, true)
			.then(res => {
				setOrdersData(res.orders)
				setTotalPages(res.totalPages)
			})
			.catch(err => console.log(err))
	}

	function MainComponent() {
		return <>
			<OrderTable hideTitle
				columnsData={VendorOrderColumnsData}
				tableData={OrdersData}
			/>
			<PageNumberCount CurrentPage={CurrentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} />
		</>
	}

	return (
		<Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
			{!IsLoading ? null : IsLoading === "id" ? <OrderScreen key={CurId} /> : <MainComponent />}
		</Box>
	);
}
