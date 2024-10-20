import {
	Flex,
	Table,
	Icon,
	Tbody,
	Td,
	Text,
	Th,
	Thead,
	Tr,
	useColorModeValue,
} from "@chakra-ui/react";
import React, { useMemo } from "react";
import {
	useGlobalFilter,
	usePagination,
	useSortBy,
	useTable,
} from "react-table";
import { useHistory } from "react-router-dom";

// Custom components
import Card from "components/card/Card";

// Assets
import { MdCheckCircle, MdWarningAmber, MdWarning } from "react-icons/md";

export default function OrdersTable(props) {
	const { columnsData, tableData, hideTitle } = props;
	const history = useHistory()

	const columns = useMemo(() => columnsData, [columnsData]);
	const data = useMemo(() => tableData, [tableData]);

	const tableInstance = useTable(
		{
			columns,
			data,
		},
		useGlobalFilter,
		useSortBy,
		usePagination
	);

	const {
		getTableProps,
		getTableBodyProps,
		headerGroups,
		page,
		prepareRow,
		initialState,
	} = tableInstance;

	initialState.pageSize = 100;

	const textColor = useColorModeValue("secondaryGray.900", "white");
	const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");

	// Functions
	function handleOrderClick(id) {
		history.push(`/admin/orders?id=${id}`)
	}

	return (
		<Card
			direction='column'
			w='100%'
			px='0px'
			py='10px'
			pt={hideTitle ? '10px' : '20px'}
			style={{ minHeight: 400 }}>

			{/* Title */}
			{!hideTitle && <Flex px='25px' justify='space-between' mb='10px' align='center'>
				<Text
					color={textColor}
					fontSize='22px'
					fontWeight='700'
					lineHeight='100%'>
					Orders
				</Text>
			</Flex>}


			<Table {...getTableProps()} variant='simple' color='gray.500'>

				{/* Table Headings */}
				<Thead>
					{headerGroups.map((headerGroup, index) => (
						<Tr {...headerGroup.getHeaderGroupProps()} key={index}>
							{headerGroup.headers.map((column, index) => (
								<Th
									{...column.getHeaderProps(column.getSortByToggleProps())}
									pe='10px'
									key={index}
									borderColor={borderColor}>
									<Flex
										justify='space-between'
										align='center'
										fontSize={{ sm: "10px", lg: "12px" }}
										color='gray.400'>
										{column.render("Header")}
									</Flex>
								</Th>
							))}
						</Tr>
					))}
				</Thead>

				{/* Table Rows */}
				<Tbody {...getTableBodyProps()}>
					{page.map((row, index) => {
						prepareRow(row);
						const orderData = row.original

						return (
							<Tr {...row.getRowProps()} key={index} className="hoverBaby" onClick={() => handleOrderClick(orderData.id)}>
								{row.cells.map((cell, index) => {
									let data = "";
									if (cell.column.Header === "ID") {
										data = (
											<Text color={textColor} fontSize='sm' fontWeight='700'>
												ZP0{cell.value}
											</Text>
										);
									} else if (cell.column.Header === "FILES") {
										data = (
											<Text color={textColor} fontSize='sm' fontWeight='700'>
												{cell.value}
											</Text>
										);
									} else if (cell.column.Header === "STATUS") {
										let statusTitleCase = ""
										let color = textColor

										if (orderData.order_details?.isCancelled) {
											if (orderData.order_details?.isRefunded) {
												color = "orange.300"
												statusTitleCase = "Refunded"
											}
											color = "orange.300"
											statusTitleCase = "Cancelled"
										}
										else if (orderData.delivery_location?.length === orderData.shop_id.length && orderData.shop_id.every(item => parseInt(item) >= 0) && (cell.value.length === 0 || !cell.value.every(item => item))) {
											color = "green"
											statusTitleCase = "Assigned"
										}
										else if (cell.value.length === 0 || !cell.value.every(item => item)) {
											statusTitleCase = "Pending"
										}
										else if (cell.value.every(item => ["out", "delivered"].includes(item))) {
											statusTitleCase = "Delivered"
										}
										else if (cell.value.some(item => item === 'rejected')) {
											color = "red"
											statusTitleCase = "Rejected"
										}
										else if (cell.value.some(item => item === 'delayed')) {
											color = "red"
											statusTitleCase = "Delayed"
										}
										else {
											color = "green"
											statusTitleCase = "Processing"
										}


										data = (
											<Flex align='center'>
												<Text mr="10px" color={color} fontSize='sm' fontWeight='700'>
													{statusTitleCase}
												</Text>
												{statusTitleCase === "Assigned" ? <Icon
													w='24px'
													h='24px'
													color={"green.500"}
													as={MdCheckCircle}
												/> : statusTitleCase === "Pending" ? <Icon
													ml="9px"
													w='24px'
													h='24px'
													color={"orange.500"}
													as={MdWarningAmber}
												/> : statusTitleCase === "Delayed" ? <Icon
													ml="9px"
													w='24px'
													h='24px'
													color={"red.500"}
													as={MdWarning}
												/> : null}
											</Flex>
										);
									} else if (cell.column.Header === "CREATED AT") {
										const date = new Date(cell.value).toLocaleString('en-in');
										data = (
											<Text color={textColor} fontSize='sm' fontWeight='700'>
												{date}
											</Text>
										);
									}

									return (
										<Td {...cell.getCellProps()}
											key={index}
											fontSize={{ sm: "14px" }}
											maxH='30px !important'
											py='8px'
											minW={{ sm: "150px", md: "200px", lg: "auto" }}>
											{data}
										</Td>
									);
								})}
							</Tr>
						);
					})}
				</Tbody>
			</Table>

			{/* No orders yet */}
			{data.length === 0 && <Flex justify='center' mb='10px' align='center' mt={10}>
				<Text
					color={textColor}
					fontSize='22px'
					fontWeight='700'
					lineHeight='100%'>
					No Orders Yet!
				</Text>
			</Flex>}

		</Card>
	);
}
