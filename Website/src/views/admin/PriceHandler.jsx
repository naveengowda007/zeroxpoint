import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
	Box,
	IconButton,
	Table,
	Thead,
	Tr,
	Th,
	Tbody,
	Td,
	Input,
	useColorModeValue,
	Button,
	useToast,
	Spinner,
	Grid, GridItem,
} from '@chakra-ui/react';
import { DeleteIcon, AddIcon } from '@chakra-ui/icons';
import PaperSize from './components/PaperSize';
import Card from 'components/card/Card';
import { handleNumericScroll, hpost, scrollTop } from 'res';


export default function PriceHandler() {
	const toast = useToast()
	const textColor = useColorModeValue("secondaryGray.900", "white");
	const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");

	const [IsLoading, SetIsLoading] = useState(false)
	const [deliveryCharge, setDeliveryCharge] = useState('');
	const [paperTypes, setPaperTypes] = useState([{ id: 1, name: "" }]);
	const [bindingOptions, setBindingOptions] = useState([{ id: 1, name: "", price: "" }]);
	const [PaperSizeData, setPaperSizeData] = useState([{ id: 1, name: "", paperType: null, bwSingleSide: "", bwDoubleSide: "", colorSingleSide: "", colorDoubleSide: "" }]);

	useLayoutEffect(() => {
		scrollTop()
		getPrices();
	}, [])

	useEffect(() => {
		if (!paperTypes[0].name) return
		const newData = PaperSizeData.map(item => {
			if (!item.paperType) {
				item.paperType = paperTypes[0]
			}
			else {
				const typeItem = paperTypes.find(paperType => paperType.id === item.paperType.id)
				if (!typeItem) {
					item.paperType = paperTypes[0]
				}
				else item.paperType = typeItem
			}

			return item
		})
		setPaperSizeData(newData)
	}, [paperTypes])


	const handleDeliveryInputChange = (e) => {
		const value = e.target.value;
		setDeliveryCharge(value);
		//console.log('Entered number:', value);
	};

	const handlePaperTypeInputChange = (id, name) => {
		const updatedPaperTypes = paperTypes.map((paperType) =>
			paperType.id === id ? { ...paperType, name } : paperType
		);
		setPaperTypes(updatedPaperTypes);
	};

	const handleBindingOptionInputChange = (id, field, value) => {
		const updatedBindingOptions = bindingOptions.map((bindingOption) =>
			bindingOption.id === id ? { ...bindingOption, [field]: value } : bindingOption
		);
		setBindingOptions(updatedBindingOptions);
	};


	const handleAddPaperType = () => {
		const newId = paperTypes.length + 1;
		setPaperTypes([...paperTypes, { id: newId, name: "" }]);
	};

	const handleAddBindingOption = () => {
		const newId = bindingOptions.length + 1;
		setBindingOptions([...bindingOptions, { id: newId, name: "", price: "" }]);
	};

	const handleCancelPaperType = (id) => {
		const updatedPaperTypes = paperTypes.filter(
			(paperType) => paperType.id !== id
		);
		setPaperTypes(updatedPaperTypes);
	};

	const handleCancelBindingOption = (id) => {
		const updatedBindingOptions = bindingOptions.filter(
			(bindingOption) => bindingOption.id !== id
		);
		setBindingOptions(updatedBindingOptions);
	};

	const showFillFieldsError = () => toast({
		title: 'Fill all required fields!',
		status: 'warning',
		duration: 3000,
		isClosable: true,
	})

	const getPrices = () => {
		hpost("/getAdminPrice", null, true)
			.then(res => {
				// console.log(JSON.stringify(res, null, 2));
				res = res.price_table
				setDeliveryCharge(res.deliveryCharge)
				setPaperTypes(res.paperTypes)
				setBindingOptions(res.bindingOptions)
				setPaperSizeData(res.PaperSizeData)
			})
			.catch(err => console.log(err))
	}




	const handleSave = () => {
		// Check if delivery charge is empty
		if (!deliveryCharge) {
			toast({
				title: 'Delivery charge is empty. Please enter a value.',
				status: 'warning',
				duration: 3000,
				isClosable: true,
			})
			return;
		}

		// Check if paper types are empty
		if (!paperTypes.every((item) => item.name)) {
			showFillFieldsError()
			return
		}

		// Check if binding options are empty
		if (!bindingOptions.every((item) => item.name && item.price)) {
			showFillFieldsError()
			return
		}

		// Check if PaperSize options are empty
		let paperSizeErrors = PaperSizeData.every((item) => Object.entries(item).every(([key, value]) => value));
		if (!paperSizeErrors) {
			showFillFieldsError()
			return
		}

		// All fields have values, proceed with saving
		const data = {
			paperTypes,
			deliveryCharge,
			bindingOptions,
			PaperSizeData
		}
		// console.log(JSON.stringify(data, null, 2));

		SetIsLoading(true)
		hpost("/setAdminPrice", { data }, true)
			.then(res => {
				// console.log(res);
				setTimeout(() => {
					toast({
						title: 'Prices saved successfully!',
						status: 'success',
						duration: 3000,
						isClosable: true,
					})
					SetIsLoading(false)
				}, 700);
			})
			.catch(err => {
				console.log(err)
				SetIsLoading(false)
				// here set the state to show error

			});
	};

	const RenderPaperTypeRows = () => {
		return paperTypes.map((paperType, index) => (
			<Tr key={paperType.id} width="100%">
				<Td width="100%">
					<Input
						fontSize="15px"
						value={paperType.name}
						onChange={(e) => handlePaperTypeInputChange(paperType.id, e.target.value)}
						placeholder="Enter Paper Type"
						border='1px'
						borderColor='black'
						fontFamily='sans-serif'
					/>
				</Td>
				{paperType.id === 1 ? <Box mt="15px" ml="-15px" mr="10px" width={"41px"} />
					: (<Box mt="18px" ml="-15px" mr="10px">
						<IconButton
							icon={<DeleteIcon />}
							onClick={() => handleCancelPaperType(paperType.id)}
						/>
					</Box>)}
			</Tr>
		));
	};

	const renderBindingOptionRows = () => {
		return bindingOptions.map((bindingOption) => (
			<Tr key={bindingOption.id}>
				<Td>
					<Input
						fontSize="15px"
						value={bindingOption.name}
						onChange={(e) => handleBindingOptionInputChange(bindingOption.id, "name", e.target.value)}
						placeholder="Binding Option"
						border='1px'
						borderColor='black'
						fontFamily='sans-serif'
					/>
				</Td>
				<Td width="200px">
					<Input
						fontSize="15px"
						type='number'
						value={bindingOption.price}
						onChange={(e) => handleBindingOptionInputChange(bindingOption.id, "price", e.target.value)}
						placeholder="Enter price"
						border='1px'
						borderColor='black'
						fontFamily='sans-serif'
						onWheel={handleNumericScroll}
					/>
				</Td>
				{bindingOption.id === 1 ? <Box mt="18px" ml="-15px" mr="10px" width={"41px"} />
					:
					(<Box mt="18px" ml="-15px" mr="10px">
						<IconButton
							icon={<DeleteIcon />}
							onClick={() => handleCancelBindingOption(bindingOption.id)}
						/>
					</Box>)}
			</Tr>
		));
	};

	return (
		<div style={{ maxWidth: 1400 }}>
			<Box pt={{ base: "130px", md: "80px", xl: "80px" }} fontSize="17px" mb="20px">
				<div style={{ display: "flex", alignItems: "center", marginTop: '20px' }}>
					<span style={{ marginRight: "15px", fontFamily: 'DM Sans', minWidth: "150px", fontWeight: "500" }}>Delivery Charge : </span>
					<Input
						boxShadow={"0px 18px 40px rgba(112, 144, 176, 0.12)"}
						type='number'
						fontSize="15px"
						placeholder="Enter Amount"
						border='1px'
						borderColor='black'
						fontFamily='sans-serif'
						value={deliveryCharge}
						onChange={handleDeliveryInputChange}
						backgroundColor={"#FFF"}
						width="250px"
						onWheel={handleNumericScroll}
					/>
				</div>
			</Box>

			<Grid templateColumns={{
				base: 'repeat(2, 1fr)',
				lg: "1fr 1fr 1fr",
			}} gap={12}>
				{/* Paper Type */}
				<GridItem style={{ flex:1, minWidth: "350px" }}>
					<Box fontSize="17px">
						<div style={{ display: "flex", alignItems: "center" }}>
							<span style={{ marginRight: "15px", fontFamily: 'DM Sans', marginBottom: '15px', minWidth: "150px", fontWeight: "500" }}>
								Paper Type :
							</span>
						</div>
					</Box>

					<Card direction='column'
						w='100%'
						px='0px'
						pr="5px"
						py='10px'
						style={{ minHeight: 50 }}>
						<Table variant="simple" color='gray.500' mb='15px'>
							<Thead>
								<Tr>
									<Th color={textColor} borderColor={borderColor} fontFamily='DM Sans' textAlign="center">Name</Th>
								</Tr>
							</Thead>
							<Tbody>
								{RenderPaperTypeRows()}
							</Tbody>
						</Table>
						<Box textAlign="center">
							<IconButton
								textColor={textColor}
								icon={<AddIcon />}
								onClick={handleAddPaperType}
							/>
						</Box>
					</Card>
				</GridItem>

				{/* Binding Options */}
				<GridItem style={{ flex:1, minWidth: "500px" }}>
					<Box fontSize="17px">
						<div style={{ display: "flex", alignItems: "center" }}>
							<span style={{ marginRight: "15px", fontFamily: 'DM Sans', marginBottom: '15px', minWidth: "150px", fontWeight: "500" }}>Binding Option : </span>
						</div>
					</Box>
					<Card direction='column'
						w='100%'
						px='0px'
						py='10px'
						style={{ minHeight: 50 }}>
						<Table variant="simple" color='gray.500' mb='15px'>
							<Thead>
								<Tr pe='10px'>
									<Th color={textColor} borderColor={borderColor} fontFamily='DM Sans' textAlign="center" >Name</Th>
									<Th color={textColor} borderColor={borderColor} fontFamily='DM Sans' textAlign="center" >Price</Th>
								</Tr>
							</Thead>
							<Tbody>
								{renderBindingOptionRows()}
							</Tbody>
						</Table>
						<Box textAlign="center">
							<IconButton
								textColor={textColor}
								icon={<AddIcon />}
								onClick={handleAddBindingOption}
							/>
						</Box>
					</Card>
				</GridItem>
			</Grid>

			{/* Paper Size */}
			<PaperSize PaperSizeData={PaperSizeData} setPaperSizeData={setPaperSizeData} paperTypes={paperTypes} />


			{/* Save */}
			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
				<Button bg='green.300'
					size='lg'
					borderRadius="15px"
					width="200px"
					_hover={{ transform: 'scale(1.05)' }}
					_active={{ transform: 'scale(0.95)' }}
					onClick={handleSave}
					boxShadow={"0px 18px 40px rgba(112, 144, 176, 0.12)"}
				>
					Save {IsLoading && <Spinner ml="15px" color='#FFF' />}
				</Button>
			</div>
		</div>
	)
}