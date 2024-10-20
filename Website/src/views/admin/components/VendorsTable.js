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
import { MdCancel } from "react-icons/md";
import "assets/css/App.css";

export default function UsersTable(props) {
	const { columnsData, tableData, CurrentPage } = props;

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
	function handleUserClick(userid) {
		history.push(`/admin/vendors?id=${userid}`)
	}

	return (
		<Card
			direction='column'
			w='100%'
			px='0px'
			py='10px'
			style={{ minHeight: 400 }}>

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
						const UserData = row.original

						return (
							<Tr {...row.getRowProps()} key={index} className="hoverBaby" onClick={() => handleUserClick(UserData.userid)}>
								{row.cells.map((cell, Trindex) => {
									let data = "";
									if (cell.column.Header === "NO") {
										data = (
											<Text color={textColor} fontSize='sm' fontWeight='700'>
												{(index + 1) + (50 * CurrentPage)}
											</Text>
										);
									} else if (cell.column.Header === "NAME") {
										data = (
											<Text color={textColor} fontSize='sm' fontWeight='700'>
												{cell.value}
											</Text>
										);
									} else if (cell.column.Header === "PHONE") {
										data = (
											<Flex align='center'>
												<Text color={textColor} fontSize='sm' fontWeight='700'>
													{cell.value}
												</Text>
											</Flex>
										);
									} else if (cell.column.Header === "CREATED AT") {
										const date = new Date(cell.value).toLocaleDateString('en-in');
										data = (
											<Text color={textColor} fontSize='sm' fontWeight='700'>
												{date}
											</Text>
										);
									} else if (cell.column.Header === "EMAIL") {
										data = (
											<Flex align='center'>
												<Text color={textColor} fontSize='sm' fontWeight='700'>
													{cell.value}
												</Text>
											</Flex>
										);
									} else if (cell.column.Header === "DELETED") {
										data = (cell.value ?
											<Icon
												w='24px'
												h='24px'
												ms='10px'
												color={"orange.500"}
												as={MdCancel}
											/> : null);
									}

									return (
										<Td {...cell.getCellProps()}
											key={Trindex}
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
					No Users Yet!
				</Text>
			</Flex>}

		</Card>
	);
}
