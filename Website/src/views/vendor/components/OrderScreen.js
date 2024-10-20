// Chakra imports
import React, { useEffect, useState } from "react";
import {
	Flex,
	Text,
	Grid,
	Icon,
	Button,
	Spinner,
	useToast,
	Box,
	MenuDivider,
} from "@chakra-ui/react";
import {
	AlertDialog,
	AlertDialogBody,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogContent,
	AlertDialogOverlay,
} from '@chakra-ui/react'
import { Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useLocation, useHistory } from "react-router-dom";
import queryString from 'query-string';
import { formatDate, hpost, scrollTop } from "res";

// Custom components
import Card from "components/card/Card";
import { MdCheckCircle, MdCloudDownload, MdStore, MdCancel } from "react-icons/md";
import { useSelector } from "react-redux";

// Assets
export default function OrderScreen() {
	const location = useLocation();
	const history = useHistory()
	const toast = useToast()

	const { id: CurShopID } = useSelector(state => state.UserData)

	const statusOptions = [
		{
			name: "Printing",
			value: "printing",
		},
		{
			name: "Ready For Pickup",
			value: "waiting",
		},
		{
			name: "Order Picked Up",
			value: "out",
		}
	]

	// states
	const [Orderid, setOrderid] = useState("")
	const [OrderData, setOrderData] = useState()
	const [Cart, setCart] = useState({})
	const [DeliveryLocations, setDeliveryLocations] = useState([]);
	const [Delivered, setDelivered] = useState(false)
	const [Cancelled, setCancelled] = useState(false)
	const [ShowDownload, setShowDownload] = useState(false)
	const [IsDownload, setIsDownload] = useState(false)
	const [CurDeliveryIndex, setCurDeliveryIndex] = useState()
	const [ShowRejectModal, setShowRejectModal] = useState(false)
	const [ShowPickUpModal, setShowPickUpModal] = useState(false)
	const [ShowOrderDetails, setShowOrderDetails] = useState(false)

	// Prices
	const [bindingOptions, setBindingOptions] = useState([]);
	const [PaperSizeData, setPaperSizeData] = useState([]);
	const [TotalPrice, setTotalPrice] = useState(0)

	useEffect(() => {
		scrollTop()
		getPrices()

		let intervalID;
		const parsed = queryString.parse(location.search);

		if (parsed?.id) {
			setOrderid(parsed?.id)
			getOrderData(parsed?.id)

			intervalID = setInterval(() => {
				getOrderData(parsed?.id)
			}, 10000);
		}

		return () => clearInterval(intervalID)
	}, []);

	useEffect(() => {
		if (!OrderData) return

		if (OrderData.status.length > 0 && OrderData.status.every(item => item === 'delivered')) {
			setDelivered(true)
			setCancelled(false)
		} else if (OrderData.order_details?.isCancelled) {
			setDelivered(false)
			setCancelled(true)
		}
		setCart(OrderData.cart)

		let flag = false
		for (let index = 0; index < DeliveryLocations.length; index++) {
			const shop = OrderData.shop[index]
			const status = OrderData.status[index]
			if (CurShopID === shop?.id && status && status !== "rejected") {
				flag = true
			}
		}

		if (flag) {
			setShowOrderDetails(true)
		}
	}, [OrderData, CurShopID, DeliveryLocations])

	useEffect(() => {
		if (Cancelled) {
			setShowDownload(false)
			return
		}

		const showDownloadStatus = DeliveryLocations.some((item, index) => {
			const shop = OrderData.shop[index]
			let status = OrderData.status[index]
			const delivered = ["out", "delivered"].includes(status)
			const delayed = status === "delayed"

			if (CurShopID !== shop?.id) return false

			return status && !delayed && !Cancelled && !delivered
		})

		setShowDownload(showDownloadStatus)

	}, [Cancelled, DeliveryLocations])

	useEffect(() => {
		const AllItems = Cart?.order_details?.cart
		let SumPrice = 0

		for (let index = 0; index < AllItems?.length; index++) {
			const CartItem = AllItems[index];
			let CurPaperSize = PaperSizeData?.find(item => item?.name === CartItem?.size?.name && item?.paperType?.id === CartItem?.size?.paperType?.id)
			let CurBinding = bindingOptions?.find(item => item?.id === CartItem?.binding?.id)

			if (!CurPaperSize || !CurPaperSize) {
				return
			}

			let CurTotalPrice = 0
			let CurPageCost = 0

			// Check for Color
			if (CartItem?.color === "BW") {
				if (CartItem?.sides === "single-side") {
					CurPageCost = parseFloat(CurPaperSize.bwSingleSide)
				} else {
					CurPageCost = parseFloat(CurPaperSize.bwDoubleSide)
				}
			}
			else {
				if (CartItem?.sides === "single-side") {
					CurPageCost = parseFloat(CurPaperSize.colorSingleSide)
				} else {
					CurPageCost = parseFloat(CurPaperSize.colorDoubleSide)
				}
			}

			// Check for Sides
			if (CartItem?.sides === "single-side") {
				CurTotalPrice = CurPageCost * CartItem?.pages
			}
			else {
				CurTotalPrice = CurPageCost * Math.ceil(CartItem?.pages / 2)
			}

			CurTotalPrice += parseFloat(CurBinding?.price)
			CurTotalPrice *= CartItem?.copies

			if (CartItem?.sides !== "single-side") {
				CurPageCost /= 2
			}

			SumPrice += CurTotalPrice
		}

		setTotalPrice(SumPrice)
	}, [Cart, bindingOptions, PaperSizeData])

	const getPrices = () => {
		hpost("/getVendorPrice", { justFetch: true }, true)
			.then(res => {
				// console.log(JSON.stringify(res, null, 2));
				res = res.price_table
				setPaperSizeData(res.PaperSizeData);
				setBindingOptions(res.bindingOptions);
			})
			.catch(err => {
				console.log(err);
			})
	}


	function getOrderData(uid = Orderid) {
		hpost(`/getOrder/${uid}`, {}, true)
			.then(res => {
				// console.log(res);
				setOrderData(res)
				setDeliveryLocations(res.delivery_location)
			})
			.catch(err => {
				console.log(err);
				history.push(`/admin/orders`)
			})
	}

	function updateOrderStatus(CurStatus, CurIndex = CurDeliveryIndex) {
		const data = {
			Orderid,
			CurDeliveryIndex: CurIndex,
			CurStatus
		}

		hpost(`/orderStatus`, data, true)
			.then(res => {
				// console.log(res);
				getOrderData()
				setCurDeliveryIndex()
				setShowRejectModal(false)
				setShowPickUpModal(false)
				if (CurStatus === "printing") {
					toast({
						title: 'Order Accepted!',
						status: 'success',
						duration: 3000,
						isClosable: true,
					})
				} else if (CurStatus === "rejected") {
					toast({
						title: 'Order Rejected!',
						status: 'error',
						duration: 3000,
						isClosable: true,
					})
				} else toast({
					title: 'Order Status Updated!',
					status: 'success',
					duration: 3000,
					isClosable: true,
				})

			})
			.catch(err => {
				console.log(err);
				toast({
					title: 'Something went wrong, please try again',
					status: 'warning',
					duration: 3000,
					isClosable: true,
				})
				setCurDeliveryIndex()
				setShowRejectModal(false)
				setShowPickUpModal(false)
			})
	}

	function handleDownload() {
		const { id } = OrderData

		setIsDownload(true)
		hpost(`/downloadCart/${id}`, {}, true)
			.then(res => {
				setIsDownload(false)
				window.open(res.link, "_blank");
			})
			.catch(err => {
				console.log(err);
				setIsDownload(false)
				toast({
					title: 'Could not download files!',
					status: 'error',
					duration: 3000,
					isClosable: true,
				})
			})
	}

	if (!OrderData) {
		return null
	}

	return (
		<Card
			direction='column'
			w='100%'
			px='0px'
			overflowX={{ sm: "scroll", lg: "hidden" }}
			style={{ minHeight: 400 }}
		>
			{/* Title */}
			<Flex px='25px' justify='space-between' my='10px' mx="15px" alignItems='center'>
				<Flex>
					<Text ml="10px"
						color={"secondaryGray.900"}
						fontSize='22px'
						fontWeight='700'
						lineHeight='100%'
					>
						Order ID:
					</Text>
					<Text ml="10px"
						color={"secondaryGray.900"}
						fontSize='22px'
						lineHeight='100%'
					>
						#ZP0{OrderData.id}
					</Text>
				</Flex>

				{(Delivered || Cancelled) && <Flex alignItems="center">
					<Icon
						w='24px'
						h='24px'
						ml='10px'
						color={Delivered ? "green.500" : "orange.500"}
						as={Delivered ? MdCheckCircle : Cancelled ? MdCancel : null}
					/>
					<Text color={"secondaryGray.900"}
						fontSize='22px'
						fontWeight='700'
					>{Delivered ? "Delivered" : Cancelled ? "Cancelled" : ""}</Text>
				</Flex>}

				<Flex align="center">
					<Text fontSize='16px' fontWeight='600' mr="20px">
						Created On:
						<span style={{ marginLeft: "20px", fontWeight: "normal" }}>
							{formatDate(OrderData.created_at)}
						</span>
					</Text>
				</Flex>
			</Flex>

			{/* DataData */}
			<Card px='25px' ml="20px">
				<Text fontSize='16px' fontWeight='600' mt='15px'>
					Orders: {DeliveryLocations.length}
				</Text>

				{DeliveryLocations.map((item, index) => {
					const shop = OrderData.shop[index]
					let status = OrderData.status[index]
					const delivered = ["out", "delivered"].includes(status)
					const delayed = ["rejected", "delayed"].includes(status)

					if (CurShopID !== shop?.id) return null

					switch (status) {
						case 'out':
						case 'delivered':
							status = "out"
							break;
						default: break
					}

					return <Flex alignItems="center" key={index} maxW="80%">
						{shop &&
							<Card maxWidth="500px"
								bg={delivered ? "#caffca" : delayed ? "red.400" : "#fff"}
								boxShadow={"0px 3px 10px rgba(0, 0, 0, 0.2)"}
								p="15px"
								borderRadius="10px"
								my="15px"
							>
								<Flex flex={1} mb="5px">
									{`#${shop?.id}`}
									<Icon as={MdStore} w='20px' h='20px' mr='10px' ml="3px" />
									<Text fontWeight="medium">
										{shop.shop_name}, {shop.phone}
									</Text>
								</Flex>
								<Text fontSize={"13.5px"} fontWeight="500">
									{shop.address_text}
								</Text>
							</Card>
						}

						{!Cancelled && (status ?
							<Menu>
								<MenuButton isDisabled={status === "out" || status === "rejected"} as={Button} rightIcon={<ChevronDownIcon />} bg={["out", "delivered"].includes(status) ? "#caffca" : status === "rejected" ? "#FEF7EC" : "#FEFEFE"}
									variant="outline" size="md" mx="20px" borderRadius="7px" minW="130px">
									{statusOptions.find(val => val.value === status)?.name || status.toUpperCase()}
								</MenuButton>
								<MenuList>
									{statusOptions.slice(0, 2).map((status, statusIndex) => (
										<MenuItem onClick={() => updateOrderStatus(status.value, index)}
											key={statusIndex}
											color={"black"}
											fontWeight={"normal"}
										>
											{status.name}
										</MenuItem>
									))}

									<MenuDivider />

									{/* Mark Order Picked up */}
									<MenuItem onClick={() => {
										setCurDeliveryIndex(index)
										setShowPickUpModal(true)
									}}
										color={"black"}
										fontWeight={"normal"}
									>
										Order Picked Up
									</MenuItem>
								</MenuList>
							</Menu>

							:

							<Flex>
								<Button onClick={() => {
									setCurDeliveryIndex(index)
									setShowRejectModal(true)
								}} mx="20px"
									bgColor='orange.400' color='white' variant='outline' borderRadius="15px"
									_hover={{ transform: 'scale(1.05)' }}
								>
									<Icon mr="7px"
										h='24px'
										w='24px'
										color='white'
										as={MdCancel}
									/>
									Reject
								</Button>

								<Button onClick={() => updateOrderStatus("printing", index)}
									bgColor='#59BA41' color='white' variant='outline' borderRadius="15px"
									_hover={{ transform: 'scale(1.05)' }}
								>
									<Icon mr="7px"
										h='24px'
										w='24px'
										color='white'
										as={MdCheckCircle}
									/>
									Accept
								</Button>
							</Flex>
						)}
					</Flex>
				})}


				{ShowDownload && OrderData.filesCount > 0 && <Card my="15px" mt="50px" w="400px"
					boxShadow={"0px 3px 20px rgba(112, 144, 176, 0.2)"}
					p="10px"
					mr="25%"
					alignSelf="center"
					borderRadius="10px"
				>
					<Flex justifyContent="space-between" alignItems="center" ml="45px">
						<Flex alignItems="center" mt="1px">
							<Text
								color={"secondaryGray.900"}
								fontSize='16px'
								fontWeight='700'
							>Files:
							</Text>

							<Text ml="15px"
								color={"secondaryGray.900"}
								fontSize='16px'
								fontWeight='500'
							>
								{OrderData.filesCount}
							</Text>
						</Flex>

						<Button onClick={handleDownload}
							bgColor='#59BA41' color='white' variant='outline' borderRadius="15px"
							_hover={{ transform: 'scale(1.05)' }}
							width='200px'
						>
							{IsDownload ? "Preparing Files" : "Download Files"}
							{IsDownload ? <Spinner ml="15px" color='#FFF' /> : <Icon ml="10px"
								h='24px'
								w='24px'
								color='white'
								as={MdCloudDownload}
							/>}
						</Button>
					</Flex>
				</Card>}


				{ShowOrderDetails && <>
					<Flex justifyContent="center" my="10px" mt="60px" maxW="700px">
						<Text style={{ color: "rgba(32, 76, 158, 1)", fontWeight: "700", fontSize: 15 }}>
							Order Created: {new Date(OrderData.created_at).toLocaleDateString() + "  " + new Date(OrderData.created_at).toLocaleTimeString()}
						</Text>

						<Text style={{ color: "rgba(32, 76, 158, 1)", fontWeight: "700", fontSize: 15, marginLeft: "30px" }}>
							({Cart?.order_details?.cart?.length} Items)
						</Text>
						<Text style={{ color: "rgba(32, 76, 158, 1)", fontWeight: "700", fontSize: 15, marginLeft: "15px" }}>
							₹ {TotalPrice}
						</Text>
					</Flex>

					{Cart?.order_details?.PrintingInstructions !== "" && <Flex justifyContent="center" maxW="700px">
						<Card p="10px" m="10px" borderRadius="7px" maxW="500px"
							boxShadow={"0px 3px 20px rgba(0, 0, 0, 0.11)"}
						>
							<Text style={{ color: "rgba(32, 76, 158, 1)", fontWeight: "700", fontSize: 14 }} mb="5px">
								Printing Instructions :
							</Text>
							<Text style={{ fontWeight: "700", fontSize: 15 }} my="2px">
								{Cart?.order_details?.PrintingInstructions}
							</Text>
						</Card>
					</Flex>}

					<Grid templateColumns={{ base: 'repeat(2, 1fr)' }} gap="50px" maxW="850px">
						{Cart?.order_details?.cart.map((item, index) => {
							let fileExtension = item.uri.split('/').pop();

							return <Card key={index} flex={1} maxWidth="400px"
								bg="#fff"
								boxShadow={"0px 3px 10px rgba(0, 0, 0, 0.15)"}
								p="10px"
								my="15px"
								borderRadius="15px"
							>
								<Text style={{ textAlign: "center", fontWeight: "bold", fontSize: 13 }} mb="10px">
									{fileExtension.toUpperCase()}
								</Text>

								<Flex justifyContent="space-around" alignItems="center">
									<Box textAlign="center">
										<span style={{ "white-space": "pre-line", fontSize: 13, fontWeight: "500" }}>
											{`${item.size.name}\n${item.sides}\n${item.paper.name}\n${index > 1 ? "Binding is my bitch" : item.binding.name}`}
										</span>
									</Box>
									<Box textAlign="center">
										<span style={{ "white-space": "pre-line", fontSize: 13, fontWeight: "500" }}>
											{`${item.color}\nCopies: ${item.copies}\nPages: ${item.pages}`}
										</span>
									</Box>
								</Flex>
							</Card>
						})}
					</Grid>
				</>}

			</Card>

			{/* Mark Delivered */}
			<AlertDialog isOpen={ShowRejectModal} onClose={() => {
				setCurDeliveryIndex()
				setShowRejectModal(false)
			}}>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogHeader fontSize='lg' fontWeight='bold'>
							Reject Order?
						</AlertDialogHeader>

						<AlertDialogBody>
							<span style={{ "white-space": "pre-line", fontWeight: "500" }}>
								Are you sure to mark this order as rejected?
							</span>
						</AlertDialogBody>

						<AlertDialogFooter>
							<Button onClick={() => {
								setCurDeliveryIndex()
								setShowRejectModal(false)
							}}>
								Cancel
							</Button>
							<Button colorScheme={'red'} onClick={() => updateOrderStatus("rejected")} ml={3}>
								Reject Order
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>

			{/* Pickup order */}
			<AlertDialog isOpen={ShowPickUpModal} onClose={() => {
				setCurDeliveryIndex()
				setShowPickUpModal(false)
			}}>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogHeader fontSize='lg' fontWeight='bold'>
							Order Picked Up?
						</AlertDialogHeader>

						<AlertDialogBody>
							<span style={{ "white-space": "pre-line", fontWeight: "500" }}>
								Confirm this order has been Picked Up for Delivery?
							</span>
						</AlertDialogBody>

						<AlertDialogFooter>
							<Button onClick={() => {
								setCurDeliveryIndex()
								setShowPickUpModal(false)
							}}>
								Cancel
							</Button>
							<Button colorScheme={'green'} onClick={() => updateOrderStatus("out")} ml={3}>
								Order Picked Up
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>


		</Card>
	);
}
