import React, { useState, useEffect } from 'react';
import { Box, Flex, NumberInput, NumberInputField, NumberIncrementStepper, NumberDecrementStepper, NumberInputStepper, Select, Grid, Button, Card, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';
import { hpost, scrollTop } from 'res';

const colorOptions = [
	{ name: 'Black & White', id: 'BW' },
	{ name: 'Color', id: 'Color' },
];

const sidesOptions = [
	{ name: 'Single Sided', id: 'single-side' },
	{ name: 'Double Sided', id: 'double-side' },
];

export default function PriceCalculator() {
	const [TotalPrice, setTotalPrice] = useState(0)
	const [CostPerPage, setCostPerPage] = useState(0)
	const [pages, setPages] = useState(1);
	const [copies, setCopies] = useState(1);
	const [paperTypes, setPaperTypes] = useState([]);
	const [bindingOptions, setBindingOptions] = useState([]);
	const [PaperSizeData, setPaperSizeData] = useState([]);
	const [selectedPaperSize, setSelectedPaperSize] = useState();
	const [selectedPaperType, setselectedPaperType] = useState();
	const [selectedPrintedColor, setselectedPrintedColor] = useState();
	const [selectedPrintingSides, setselectedPrintingSides] = useState();
	const [selectedBindingOptions, setselectedBindingOptions] = useState();
	const [uniquePaperSizes, setUniquePaperSizes] = useState([]);
	const [showError, setShowError] = useState();

	useEffect(() => {
		scrollTop()
		getPrices()
	}, []);

	useEffect(() => {
		if (!selectedPaperSize || !selectedPaperType || !selectedPrintedColor || !selectedPrintingSides || !selectedBindingOptions) {
			return
		}

		handleCalculate()
	}, [pages, copies, selectedPaperSize, selectedPaperType, selectedPrintedColor, selectedPrintingSides, selectedBindingOptions])

	useEffect(() => {
		if (parseInt(pages) === 1) {
			setselectedPrintingSides(sidesOptions[0])
		}
	}, [pages])

	useEffect(() => {
		const tempUniquePaperSizes = [...new Map(PaperSizeData.map(item => [item["name"], item])).values()]
		setUniquePaperSizes(tempUniquePaperSizes)

		// Set default values
		setSelectedPaperSize(tempUniquePaperSizes[0])
		setselectedPrintedColor(colorOptions[0])
		setselectedPrintingSides(sidesOptions[0])
	}, [PaperSizeData])


	const getPrices = () => {
		hpost("/getVendorPrice", { justFetch: true }, true)
			.then(res => {
				// console.log(JSON.stringify(res, null, 2));
				res = res.price_table
				setPaperTypes(res.paperTypes);
				setPaperSizeData(res.PaperSizeData);
				setBindingOptions(res.bindingOptions);

				// Set default values
				setselectedPaperType(res.paperTypes[0])
				setselectedBindingOptions(res.bindingOptions[0])
			})
			.catch(err => {
				console.log(err);
				setShowError(true);
			})
	}

	const ShowWarningRender = () => {
		// if the state is not true return null
		if (!showError) return null

		return <Alert status="error" mb="20px">
			<AlertIcon />
			<AlertTitle>Price Calculator</AlertTitle>
			<AlertDescription>Enter atleat one set of data in Price Handler to calculate price.</AlertDescription>
		</Alert>
	}


	const handlePagesChange = (value) => {
		setPages(value);
	};

	const handleCopiesChange = (value) => {
		setCopies(value);
	};

	const handlePaperSizeChange = (item) => {
		let temp = PaperSizeData.find(val => val.id === parseInt(item.target.value))
		setSelectedPaperSize(temp);
	};

	const handlePaperTypeChange = (item) => {
		let temp = paperTypes.find(val => val.id === parseInt(item.target.value))
		setselectedPaperType(temp);
	}

	const handleBindingOptionChange = (item) => {
		let temp = bindingOptions.find(val => val.id === parseInt(item.target.value))
		setselectedBindingOptions(temp)
	}

	const handlePrintedColorChange = (item) => {
		let temp = colorOptions.find(val => val.id === item.target.value)
		setselectedPrintedColor(temp)
	}

	const handlePrintingSidesChange = (item) => {
		if (parseInt(pages) === 1) {
			setselectedPrintingSides(sidesOptions[0])
			return
		}
		let temp = sidesOptions.find(val => val.id === item.target.value)
		setselectedPrintingSides(temp)
	}


	// Calculate function
	const handleCalculate = () => {
		let CurPaperSize = PaperSizeData.find(item => item.name === selectedPaperSize.name && item.paperType.id === selectedPaperType.id)

		let CurTotalPrice = 0
		let CurPageCost = 0

		// Check for Color
		if (selectedPrintedColor.id === "BW") {
			if (selectedPrintingSides.id === "single-side") {
				CurPageCost = parseFloat(CurPaperSize.bwSingleSide)
			} else {
				CurPageCost = parseFloat(CurPaperSize.bwDoubleSide)
			}
		}
		else {
			if (selectedPrintingSides.id === "single-side") {
				CurPageCost = parseFloat(CurPaperSize.colorSingleSide)
			} else {
				CurPageCost = parseFloat(CurPaperSize.colorDoubleSide)
			}
		}

		// Check for Sides
		if (selectedPrintingSides.id === "single-side") {
			CurTotalPrice = CurPageCost * pages
		}
		else {
			CurTotalPrice = CurPageCost * Math.ceil(pages / 2)
		}


		CurTotalPrice += parseFloat(selectedBindingOptions.price)
		CurTotalPrice *= copies

		if (selectedPrintingSides.id !== "single-side") {
			CurPageCost /= 2
		}

		setTotalPrice(CurTotalPrice)
		setCostPerPage(CurPageCost)
	}

	return (
		<Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
			<ShowWarningRender />
			<Grid templateColumns={{
				base: 'repeat(1, 1fr)',
				sm: 'repeat(1, 1fr)',
				md: 'repeat(2, 1fr)',
			}} w="fit-content">
				<Card p="20px" borderRadius="30px" mr="30px" maxWidth="450px">
					<Flex direction="column">
						<Grid templateColumns={{
							base: 'repeat(2, 1fr)',
						}} gap="50px">

							{/* Pages */}
							<Box style={{ fontFamily: 'DM Sans', marginBottom: '30px', minWidth: "150px", fontWeight: "500" }}>
								Pages :
								<Box borderWidth="2px" mt='15px' borderRadius="10px" overflow="hidden">
									<NumberInput min={1}
										defaultValue={pages}
										onChange={handlePagesChange}
										focusBorderColor='transparent'
										fontSize="15px"
										width="175px"
										variant='filled'
										size='sm'
									>
										<NumberInputField />
										<NumberInputStepper>
											<NumberIncrementStepper />
											<NumberDecrementStepper />
										</NumberInputStepper>
									</NumberInput>
								</Box>
							</Box>


							{/* Copies */}
							<Box style={{ fontFamily: 'DM Sans', marginBottom: '30px', minWidth: "150px", fontWeight: "500" }}>
								Copies :
								<Box borderWidth="2px" mt='15px' borderRadius="10px" overflow="hidden">
									<NumberInput min={1}
										defaultValue={copies}
										onChange={handleCopiesChange}
										focusBorderColor='transparent'
										fontSize="15px"
										width="175px"
										variant='filled'
										size='sm'
									>
										<NumberInputField />
										<NumberInputStepper>
											<NumberIncrementStepper />
											<NumberDecrementStepper />
										</NumberInputStepper>
									</NumberInput>
								</Box>
							</Box>
						</Grid>

						<Grid templateColumns={{
							base: 'repeat(2, 1fr)',
						}} gap="50px">

							{/* Paper Size */}
							<Box style={{ fontFamily: 'DM Sans', marginBottom: '30px', minWidth: "150px", fontWeight: "500" }}>
								Paper Size :
								<Select variant='filled'
									name="paperSize" mt="15px" borderColor="black"
									fontSize="15px"
									width="175px"
									value={selectedPaperSize?.id}
									onChange={handlePaperSizeChange} border='1px'>
									{uniquePaperSizes.length && uniquePaperSizes.map((item, index) => (
										<option key={index} value={item.id}>
											{item.name}
										</option>
									))}
								</Select>
							</Box>

							{/* Paper Type */}
							<Box style={{ fontFamily: 'DM Sans', marginBottom: '30px', minWidth: "150px", fontWeight: "500" }}>
								Paper Type :
								<Select variant='filled'
									name="paperType" mt="15px" borderColor="black"
									fontSize="15px"
									width="175px" border='1px'
									value={selectedPaperType?.id}
									onChange={handlePaperTypeChange}>
									{paperTypes.map((item) => (
										<option key={item.id} value={item.id}>
											{item.name}
										</option>
									))}
								</Select>
							</Box>
						</Grid>

						<Grid templateColumns={{
							base: 'repeat(2, 1fr)',
						}} gap="50px">

							{/* Printed Color */}
							<Box style={{ fontFamily: 'DM Sans', marginBottom: '30px', minWidth: "150px", fontWeight: "500" }}>
								Printed Color :
								<Select variant='filled'
									name="printedColor" mt="15px" borderColor="black"
									fontSize="15px"
									width="175px" border='1px'
									value={selectedPrintedColor?.id}
									onChange={handlePrintedColorChange}>
									{colorOptions.map((item) => (
										<option key={item.id} value={item.id}>
											{item.name}
										</option>
									))}
								</Select>
							</Box>

							{/* Printig Sides */}

							<Box style={{ fontFamily: 'DM Sans', marginBottom: '30px', minWidth: "150px", fontWeight: "500" }}>
								Printing Sides :
								<Select variant='filled'
									name="printingSides" mt="15px" borderColor="black"
									fontSize="15px"
									width="175px" border='1px'
									value={selectedPrintingSides?.id}
									onChange={handlePrintingSidesChange}>
									{sidesOptions.map((item) => (
										<option key={item.id} value={item.id}>
											{item.name}
										</option>
									))}
								</Select>
							</Box>
						</Grid>


						{/* Binding Options */}
						<Box style={{ fontFamily: 'DM Sans', marginBottom: '30px', minWidth: "150px", fontWeight: "500" }}>
							Binding Options :
							<Select variant='filled'
								name="bindingOptions" mt="15px" borderColor="black"
								fontSize="15px"
								width="175px"
								border='1px'
								value={selectedBindingOptions?.id}
								onChange={handleBindingOptionChange}>
								{bindingOptions.map((item) => (
									<option key={item.id} value={item.id}>
										{item.name}
									</option>
								))}
							</Select>
						</Box>
					</Flex>
				</Card>

				{/* Price summary card */}
				<Card flex="1" p="20px" borderRadius="30px" maxWidth="450px">
					<Grid templateColumns={{
						base: 'repeat(2, 1fr)',
					}} width="fit-content">
						<Box>
							<Box style={{ fontFamily: 'DM Sans', marginBottom: '20px', minWidth: "150px", fontWeight: "bold" }}>
								Pages :
							</Box>
							<Box style={{ fontFamily: 'DM Sans', marginBottom: '20px', minWidth: "150px", fontWeight: "bold" }}>
								Copies :
							</Box>
							<Box style={{ fontFamily: 'DM Sans', marginBottom: '20px', minWidth: "150px", fontWeight: "bold" }}>
								Paper Size :
							</Box>
							<Box style={{ fontFamily: 'DM Sans', marginBottom: '20px', minWidth: "150px", fontWeight: "bold" }}>
								Paper Type :
							</Box>
							<Box style={{ fontFamily: 'DM Sans', marginBottom: '20px', minWidth: "150px", fontWeight: "bold" }}>
								Printed Color :
							</Box>
							<Box style={{ fontFamily: 'DM Sans', marginBottom: '20px', minWidth: "150px", fontWeight: "bold" }}>
								Printing Sides :
							</Box>
							<Box style={{ fontFamily: 'DM Sans', marginBottom: '20px', minWidth: "150px", fontWeight: "bold" }}>
								Binding Options :
							</Box>
						</Box>

						<Box>
							<Box fontWeight="500" mb='20px' ml="15px">{pages || "0"}</Box>
							<Box fontWeight="500" mb='20px' ml="15px">{copies || "0"}</Box>
							<Box fontWeight="500" mb='20px' ml="15px">{selectedPaperSize?.name}</Box>
							<Box fontWeight="500" mb='20px' ml="15px">{selectedPaperType?.name}</Box>
							<Box fontWeight="500" mb='20px' ml="15px">{selectedPrintedColor?.name}</Box>
							<Box fontWeight="500" mb='20px' ml="15px">{selectedPrintingSides?.name}</Box>
							<Box fontWeight="500" mb='20px' ml="15px">{selectedBindingOptions?.name}</Box>
						</Box>
					</Grid>


					<Flex dir='row'>
						<Button bgColor='#53777A' color='white' variant='outline' width='200px'
							borderRadius="15px"
							_hover={{ transform: 'scale(1.05)' }}
							mb='20px'>Binding Price</Button>
						<span style={{ marginTop: "9px", marginLeft: "30px", fontFamily: 'DM Sans', minWidth: "150px", fontWeight: "bold" }}>
							₹ {selectedBindingOptions?.price}</span>
					</Flex>

					<Flex dir='row' mt="-10px">
						<Button bgColor='#53777A' color='white' variant='outline' width='200px'
							borderRadius="15px"
							_hover={{ transform: 'scale(1.05)' }}
							mb='20px'>COST PER PAGE</Button>
						<span style={{ marginTop: "9px", marginLeft: "30px", fontFamily: 'DM Sans', minWidth: "150px", fontWeight: "bold" }}>
							₹ {CostPerPage}</span>
					</Flex>

					<Flex dir='row'>
						<Button bgColor='#59BA41' color='white' variant='outline' borderRadius="15px"
							_hover={{ transform: 'scale(1.05)' }}
							width='200px'>TOTAL COST</Button>
						<span style={{ marginTop: "9px", marginLeft: "30px", fontFamily: 'DM Sans', minWidth: "150px", fontWeight: "bold" }}>
							₹ {TotalPrice}</span>
					</Flex>
				</Card>
			</Grid>
		</Box>
	)
}
