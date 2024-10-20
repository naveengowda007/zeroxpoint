import React, { useLayoutEffect, useState } from 'react';
import {
	Box,
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
} from '@chakra-ui/react';
import PaperSize from './components/PaperSize';
import Card from 'components/card/Card';
import { handleNumericScroll, hpost, scrollTop } from 'res';

export default function PriceHandler({ price_table }) {
	const toast = useToast()
	const textColor = useColorModeValue("secondaryGray.900", "white");
	const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");

	const [IsLoading, SetIsLoading] = useState(false)
	const [paperTypes, setPaperTypes] = useState([{ id: 1, name: "" }]);
	const [bindingOptions, setBindingOptions] = useState([{ id: 1, name: "", price: "" }]);
	const [PaperSizeData, setPaperSizeData] = useState([{ id: 1, name: "", paperType: null, bwSingleSide: "", bwDoubleSide: "", colorSingleSide: "", colorDoubleSide: "" }]);
	const [DisablePriceEdit, setDisablePriceEdit] = useState(false)

	useLayoutEffect(() => {
		scrollTop()
		getPrices();
	}, [])

	const handleBindingOptionInputChange = (id, field, value) => {
		const updatedBindingOptions = bindingOptions.map((bindingOption) =>
			bindingOption.id === id ? { ...bindingOption, [field]: value } : bindingOption
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
		if (price_table) {
			const res = price_table
			setPaperTypes(res.paperTypes)
			setBindingOptions(res.bindingOptions)
			setPaperSizeData(res.PaperSizeData)
			setDisablePriceEdit(true)
			return
		}

		hpost("/getVendorPrice", null, true)
			.then(res => {
				// console.log(JSON.stringify(res, null, 2));
				setDisablePriceEdit(!res.priceNotSet)
				res = res.price_table
				setPaperTypes(res.paperTypes)
				setBindingOptions(res.bindingOptions)
				setPaperSizeData(res.PaperSizeData)
			})
			.catch(err => console.log(err))
	}

	const handleSave = () => {
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
			bindingOptions,
			PaperSizeData
		}
		// console.log(JSON.stringify(data, null, 2));

		SetIsLoading(true)
		hpost("/setVendorPrice", { data }, true)
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
				}, 1000);
			})
			.catch(err => {
				console.log(err)
				SetIsLoading(false)
			});
	};

	const renderBindingOptionRows = () => {
		return bindingOptions.map((bindingOption) => (
			<Tr key={bindingOption.id}>
				<Td width="200px">
					<Box
						fontSize="15px"
						placeholder="Paper Size"
						fontFamily='sans-serif'
						color="#000"
						justifyItems="center"
					>
						{bindingOption.name}
					</Box>
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
						isReadOnly={DisablePriceEdit}
					/>
				</Td>
			</Tr>
		));
	};

	return (
		<Box pt={{ base: "130px", md: "80px", xl: "80px" }} style={{ maxWidth: 1400 }}>
			{/* Paper Size */}
			<PaperSize PaperSizeData={PaperSizeData} setPaperSizeData={setPaperSizeData} paperTypes={paperTypes} isReadOnly={DisablePriceEdit} />

			<Box style={{ width: "550px" }}>
				<Box mt="40px" fontSize="17px">
					<div style={{ display: "flex", alignItems: "center" }}>
						<span style={{ marginRight: "15px", fontFamily: 'DM Sans', marginBottom: '15px', minWidth: "150px", fontWeight: "500" }}>Binding Option : </span>
					</div>
				</Box>
				<Card direction='column'
					w='100%'
					px='10px'
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
				</Card>
			</Box>

			{/* Save */}
			{!DisablePriceEdit && <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
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
			</div>}
		</Box>
	)
}