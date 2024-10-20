import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
	Box,
	Button,
	Flex,
	Icon,
	Image,
	Input,
	ListItem,
	Text,
	Select, Radio,
	UnorderedList,
	useColorModeValue,
	RadioGroup,
	useToast,
} from "@chakra-ui/react";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton } from '@chakra-ui/react';
import { useHistory } from "react-router-dom";
import { useDropzone } from "react-dropzone";


// Custom components
import Card from "components/card/Card.js";

// Assets
import { MdUpload } from "react-icons/md";
import GallerySvg from 'assets/img/icons/Gallery.svg';
import DocumentSvg from 'assets/img/icons/Document.svg';
import { MinusIcon, AddIcon } from '@chakra-ui/icons';
import { updateCart } from "redux/Cart";
import { AddItemToCart } from "Utils/Scan";

const UploadFilesBanner = (props) => {
	// Chakra Color Mode
	const textColorPrimary = useColorModeValue("secondaryGray.900", "white");
	const brandColor = useColorModeValue("brand.500", "white");
	const textColorSecondary = "gray.400";
	const bg = useColorModeValue("gray.100", "navy.700");
	const borderColor = useColorModeValue("secondaryGray.100", "whiteAlpha.100");


	// App States
	const { isCartScreen, isUpdate, setFiles, Item, setItem, dispatch } = props;
	const toast = useToast()

	const Cart = useSelector((state) => {
		return state.Cart;
	});

	const Prices = useSelector((state) => {
		return state.Prices;
	});


	const [formData, setFormData] = useState({ ...Item });
	const [Copies, setCopies] = useState(1)
	const [paperTypes, setPaperTypes] = useState([]);
	const [bindingOptions, setBindingOptions] = useState([]);
	const [uniquePaperSizes, setUniquePaperSizes] = useState([]);

	const colorOptions = [
		{ label: 'Black & White', value: 'BW' },
		{ label: 'Color', value: 'Color' },
	];

	const sidesOptions = [
		{ label: 'Single Sided', value: 'single-side' },
		{ label: 'Double Sided', value: 'double-side' },
	];

	useEffect(() => {
		let item = Cart.find(cartItem => cartItem.id === Item?.id)
		if (!item) return
		setFormData({ ...Item })
		setCopies(Item.copies)
		setPaperTypes(Prices.paperTypes);
		setBindingOptions(Prices.bindingOptions);
		const tempUniquePaperSizes = [...new Map(Prices.PaperSizeData.map(item => [item["name"], item])).values()]
		setUniquePaperSizes(tempUniquePaperSizes)
	}, [Item])

	function handleUpdateCart() {
		if (
			formData &&
			formData.id &&
			formData.uri &&
			formData.pages > 0 &&
			formData.copies > 0 &&
			formData.color &&
			formData.size &&
			formData.sides &&
			formData.paper &&
			formData.binding
		) {
			dispatch(updateCart(formData))
			setFormData({})
			setItem({})

			toast({
				title: isUpdate ? "Cart updated successfully!" : "Item added to Cart!",
				status: 'success',
				duration: 3000,
				isClosable: true,
			})
		}
		else {
			toast({
				title: "Fill all the fields!",
				status: 'error',
				duration: 3000,
				isClosable: true,
			})
		}
	}

	const history = useHistory()

	const onDrop = (acceptedFiles) => {
		acceptedFiles = acceptedFiles.map(file => Object.assign(file, {
			preview: URL.createObjectURL(file)
		}))

		setFiles(val => {
			for (let index = 0; index < acceptedFiles.length; index++) {
				const element = acceptedFiles[index];
				val.push(element)
			}

			return [...val]
		})
		AddItemToCart(acceptedFiles, dispatch, Prices, setItem, Item, Cart);
	};

	const { getRootProps, getInputProps } = useDropzone({
		onDrop,
		accept: '.jpg,.jpeg,.heic,.gif,.png,.pdf,.doc,.docx,.txt,.xls,.xlsx,.pptx,.csv',
		maxSize: 500 * 1024 * 1024 //  500 MB
	});

	const handleCopiesChange = (text) => {
		while (text.startsWith('0')) {
			text = text.slice(1)
		}
		if (text === "") {
			setItem({ ...Item, copies: 0 });
			setCopies(0);
			setFormData({ ...formData, copies: parseInt(Copies) })
		} else if (/^\d+$/.test(text)) {
			if (text > 500) return;
			setItem({ ...Item, copies: parseInt(text) });
			setCopies(text);
			setFormData({ ...formData, copies: parseInt(Copies) })
		}
	};

	const handleMinus = () => {
		let temp = Number(Copies) - 1;
		if (temp < 1) return Copies;
		setCopies(temp);
		setFormData({ ...formData, copies: parseInt(Copies) })
	};

	const handlePlus = () => {
		let temp = Number(Copies) + 1;
		if (temp > 1000) return Copies;
		setCopies(temp);
		setFormData({ ...formData, copies: parseInt(Copies) })
	};

	return (
		<Box
			borderRadius="10px"
			bg="white"
			overflow="hidden"
			m={1}
		>
			<Box p={3} bgGradient="linear(to-r, #d4fc79, #96e6a1)" borderRadius="10px">
				<Card p='15px' {...getRootProps({ className: "dropzone" })}>
					<Flex h='100%' direction={{ base: "column", md: "column", lg: "row", "2xl": "row" }}>
						<Flex
							w="300px"
							me='50px'
							align='center'
							justify='center'
							bg={bg}
							border='1px dashed'
							borderColor={borderColor}
							borderRadius='16px'
							cursor='pointer'
						>
							<Input variant='main' {...getInputProps()} />
							<Box align='center'>
								<Icon as={MdUpload} w='80px' h='80px' color={brandColor} />
								<Flex justify='center' mx='auto' mb='12px'>
									<Text fontSize='xl' fontWeight='700' color={brandColor}>
										Upload Files
									</Text>
								</Flex>
								<Text fontSize='sm' fontWeight='500' color='secondaryGray.500' mt="10px">
									PDF, DOC, XL, PNG, JPG, GIF, TXT, PPT
								</Text>
							</Box>
						</Flex>

						<Flex direction='column' mt={{ base: "20px" }}>
							<Flex alignItems="center" mb="20px">
								<Image src={GallerySvg} w="55px" h="55px" />
								<Image src={DocumentSvg} w="55px" h="55px" />
								<Text
									color={textColorPrimary}
									fontWeight='bold'
									textAlign='start'
									fontSize='2xl'
									ml="25px"
								>
									Upload or Drop Files Here!
								</Text>
							</Flex>

							<Text
								color={textColorSecondary}
								fontSize='md'
								my={{ base: "auto", "2xl": "10px" }}
								mx='auto'
								textAlign='start'>
								Upload files upto 500MB and place an order from the cart screen!
							</Text>


							{!isCartScreen && <>
								<Box w='100%' my="20px">
									<Button onClick={(e) => {
										e.stopPropagation();
										history.push(`/user/cart`)
									}}
										w='140px'
										minW='140px'
										variant='brand'
										fontWeight='500'>
										Go to Cart
									</Button>
								</Box>

								<UnorderedList alignItems="flex-start">
									{Cart.map((file, index) => (
										<ListItem key={index}>{file?.name}</ListItem>
									))}
								</UnorderedList>
							</>}

						</Flex>
					</Flex>
				</Card>
			</Box>

			<Modal isOpen={formData?.id} onClose={() => setFormData({})} size="xl">
				<ModalOverlay />
				<ModalContent borderRadius="25px" maxW="500px">
					<ModalHeader>{formData.name}</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<Flex justifyContent="space-around" alignItems="center" mb={6}>
							<Box alignItems="center" style={{ alignItems: "center", fontFamily: 'DM Sans', minWidth: "100px", fontWeight: "500" }}>
								Copies:
							</Box>
							<Input
								placeholder="Number Of Copies"
								value={Copies}
								onChange={(e) => handleCopiesChange(e.target.value)}
								type="number"
								min="0"
								max="500"
							/>
							<Box display="flex" alignItems="center" justifyContent="space-between">
								<Button leftIcon={<MinusIcon />} onClick={() => handleMinus()} />
								<Text mx={1}>{Copies}</Text>
								<Button rightIcon={<AddIcon />} onClick={() => handlePlus()} />
							</Box>
						</Flex>

						<Flex justifyContent="space-around" alignItems="center" mb={6}>
							<Box alignItems="center" style={{ alignItems: "center", fontFamily: 'DM Sans', minWidth: "100px", fontWeight: "500" }}>
								Size:
							</Box>
							<Select
								placeholder="Select size"
								value={formData?.size?.id}
								onChange={(e) => {
									setFormData({ ...formData, size: uniquePaperSizes?.find((val) => val?.id == e.target.value) });
								}}
							>
								{uniquePaperSizes.map((size) => (
									<option key={size.id} value={size.id}>{size.name}</option>
								))}
							</Select>
						</Flex>

						<Flex alignItems="center" mb={6}>
							<Box alignItems="center" style={{ alignItems: "center", fontFamily: 'DM Sans', minWidth: "100px", fontWeight: "500" }}>
								Color:
							</Box>
							{colorOptions.map((option) => (
								<RadioGroup key={option.value} onChange={(value) => setFormData({ ...formData, color: value })} value={formData.color} mr="30px">
									<Radio value={option.value}>{option.label}</Radio>
								</RadioGroup>
							))}
						</Flex>

						<Flex alignItems="center" mb={6}>
							<Box alignItems="center" style={{ alignItems: "center", fontFamily: 'DM Sans', minWidth: "100px", fontWeight: "500" }}>
								Sides:
							</Box>
							{sidesOptions.map((option) => (
								<RadioGroup key={option.value} onChange={(value) => setFormData({ ...formData, sides: value })} value={formData.sides} mr="30px">
									<Radio value={option.value}>{option.label}</Radio>
								</RadioGroup>
							))}
						</Flex>

						<Flex justifyContent="space-around" alignItems="center" mb={6}>
							<Box alignItems="center" style={{ alignItems: "center", fontFamily: 'DM Sans', minWidth: "100px", fontWeight: "500" }}>
								Paper:
							</Box>
							<Select
								placeholder="Select paper"
								value={formData?.paper?.id}
								onChange={(e) => setFormData({ ...formData, paper: paperTypes?.find((val) => val?.id == e.target.value) })}
							>
								{paperTypes.map((paper) => (
									<option key={paper.id} value={paper.id}>{paper.name}</option>
								))}
							</Select>
						</Flex>

						<Flex justifyContent="space-around" alignItems="center" mb={6}>
							<Box alignItems="center" style={{ alignItems: "center", fontFamily: 'DM Sans', minWidth: "100px", fontWeight: "500" }}>
								Binding:
							</Box>
							<Select
								placeholder="Select binding"
								value={formData?.binding?.id}
								onChange={(e) => {
									setFormData({ ...formData, binding: bindingOptions?.find((val) => val?.id == e.target.value) });
								}}
							>
								{bindingOptions.map((binding) => (
									<option key={binding.id} value={binding.id}>{binding.name}</option>
								))}
							</Select>
						</Flex>

						<Card alignItems="center" justifyContent="center">
							<Button p="25px" px="30px"
								colorScheme="green"
								onClick={handleUpdateCart}
							>
								{formData.isUpdate ? "Update Cart " : "Add to Cart"}
							</Button>
						</Card>
					</ModalBody>
				</ModalContent>
			</Modal>
		</Box>
	);
};

export default UploadFilesBanner;
