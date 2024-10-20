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
	IconButton,
	Slide,
} from "@chakra-ui/react";
import {
	AlertDialog,
	AlertDialogBody,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogContent,
	AlertDialogOverlay,
} from '@chakra-ui/react'
import { useLocation, useHistory } from "react-router-dom";
import queryString from 'query-string';
import { formatDate, hpost, scrollTop } from "res";
import IconBox from "components/icons/IconBox";

// Custom components
import Card from "components/card/Card";
import MapMultipleSelect from "./MapMultipleSelect";
import { MdCheckCircle, MdCloudDownload, MdStore, MdOutlineAddHome, MdCancel, MdCheckCircle as delIcon } from "react-icons/md";
import OrderMenu from "./OrderMenu";
import { DeleteIcon } from "@chakra-ui/icons";
import MapMultiple4Orders from "./MapMultiple4Orders";

// Assets

export default function OrderScreen() {
	const location = useLocation();
	const history = useHistory()
	const toast = useToast()

	// states
	const [Orderid, setOrderid] = useState("")
	const [OrderData, setOrderData] = useState()
	const [Cart, setCart] = useState({})
	const [DeliveryLocations, setDeliveryLocations] = useState([]);
	const [Delivered, setDelivered] = useState(false)
	const [Cancelled, setCancelled] = useState(false)
	const [IsDownload, setIsDownload] = useState(false)
	const [CurSelectedLoc, setCurSelectedLoc] = useState()
	const [ShopLocations, setShopLocations] = useState()
	const [SelectedShop, setSelectedShop] = useState();

	const [SelectedShopToExpand, setSelectedShopToExpand] = useState(null)
	const [ShowDeleteShopModal, setShowDeleteShopModal] = useState(false)
	const [ShowDeliveryModal, setShowDeliveryModal] = useState(false)
	const [CurDeliveryIndex, setCurDeliveryIndex] = useState()

	useEffect(() => {
		scrollTop()

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
	}, [OrderData])

	useEffect(() => {
		if (ShopLocations?.length > 0 || CurSelectedLoc >= 0) return

		hpost(`/getShops4Order`, {}, true)
			.then(res => {
				// console.log(res);
				setShopLocations(res)
			})
			.catch(err => {
				console.log(err);
				setCurSelectedLoc()
				toast({
					title: 'Could not fetch Shops',
					status: 'warning',
					duration: 3000,
					isClosable: true,
				})
				return;
			})
	}, [CurSelectedLoc])



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

	function assignShopCall(isDelete = false) {
		const data = {
			Orderid,
			CurSelectedLoc,
			SelectedShop: SelectedShop?.id
		}

		if (isDelete === true) {
			data.isDelete = true
			data.SelectedShop = null
		}


		hpost(`/addShopToOrder`, data, true)
			.then(res => {
				// console.log(res);
				getOrderData()
				setCurSelectedLoc()
				setSelectedShop()
				setShowDeleteShopModal(false)
			})
			.catch(err => {
				console.log(err);
				toast({
					title: 'Could not assign shop',
					status: 'warning',
					duration: 3000,
					isClosable: true,
				})
			})
	}

	function markDeliverd() {
		const data = {
			Orderid,
			CurDeliveryIndex,
		}

		hpost(`/deliverOrder`, data, true)
			.then(res => {
				// console.log(res);
				getOrderData()
				setCurDeliveryIndex()
				setShowDeliveryModal(false)
				toast({
					title: 'Order marked as delivered!',
					status: 'success',
					duration: 3000,
					isClosable: true,
				})
			})
			.catch(err => {
				console.log(err);
				toast({
					title: 'Could not mark as delivered',
					status: 'warning',
					duration: 3000,
					isClosable: true,
				})
				setCurDeliveryIndex()
				setShowDeliveryModal(false)
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

					<OrderMenu Orderid={Orderid} getDataCallBack={getOrderData} />
				</Flex>
			</Flex>

			{/* MAP component */}
			<MapMultiple4Orders userLocation={DeliveryLocations} shops={OrderData.shop}/>

			{/* User data */}
			<Card px='25px' w="75%" ml="20px" mt="20px">
				<Grid templateColumns={{ sm: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }} gap={8}>
					<Flex>
						<Text fontSize='16px' fontWeight='600' mb='5px'>
							Name:
						</Text>
						<Text fontSize='16px' mb='10px' ml="20px">
							{OrderData?.user?.name}
						</Text>
					</Flex>

					<Flex>
						<Text fontSize='16px' fontWeight='600' mb='5px'>
							Phone:
						</Text>
						<Text fontSize='16px' mb='10px' ml="20px">
							{OrderData?.user?.phone}
						</Text>
					</Flex>
				</Grid>

				<Text fontSize='16px' fontWeight='600' mt='15px'>
					Orders: {DeliveryLocations?.length}
				</Text>

				{DeliveryLocations.map((item, index) => {
					const shop = OrderData.shop[index]
					let status = OrderData.status[index] || "Pending"
					const delivered = status === "delivered"
					const delayed = ["rejected", "delayed"].includes(status)

					switch (status) {
						case 'waiting':
							status = "Picking Up Order"
							break;
						case 'out':
							status = "Out For Delivery"
							break;
						default: break
					}

					function checkStatus() {
						return (SelectedShopToExpand === index && !delivered && !Cancelled) || delayed
					}

					function checkOutStatus() {
						return !delivered && !Cancelled && !delayed && status !== "Pending"
					}

					return <Flex alignItems="center" justifyContent="space-between" key={index} mb={checkStatus() ? "70px" : "0px"}>
						<Card flex={1} maxWidth="500px"
							bg={delivered ? "#caffca" : "#fff"}
							boxShadow={"0px 3px 10px rgba(0, 0, 0, 0.2)"}
							p="15px"
							my="15px"
							borderRadius="10px"
						>
							<Flex flex={1} mb="5px">
								{`#${index + 1}`}
								<Icon as={MdOutlineAddHome} w='20px' h='20px' mr='10px' ml="3px" />
								<Text fontWeight="medium">
									{item.name}, {item.phone}
								</Text>
							</Flex>
							<Text fontSize={"13.5px"} fontWeight="500">
								{item.address_text}
							</Text>
						</Card>

						<Text mx="15px" p="10px"
							color={"secondaryGray.900"}
							fontSize='13px'
							fontWeight='700'
							bg={delivered ? "#F0F9F1" : "#FEF7EC"}
							borderRadius="10px"
						>
							{status?.toUpperCase()}
						</Text>

						{shop ?
							<Card flex={1} m="0px" p="0px">
								<Card maxWidth="500px" onClick={() => !Cancelled && setSelectedShopToExpand(val => val !== index ? index : null)}
									className="hoverBaby"
									bg={delivered ? "#caffca" : delayed ? "red.400" : "#fff"}
									boxShadow={"0px 3px 10px rgba(0, 0, 0, 0.2)"}
									p="15px"
									borderRadius="10px"
									my="15px"
								>
									<Flex flex={1} mb="5px">
										{`#${shop.id}`}
										<Icon as={MdStore} w='20px' h='20px' mr='10px' ml="3px" />
										<Text fontWeight="medium">
											{shop.shop_name}, {shop.phone}
										</Text>
									</Flex>
									<Text fontSize={"13.5px"} fontWeight="500">
										{shop.address_text}
									</Text>
								</Card>

								{checkOutStatus() && <Box pos="absolute" right="-70px" top="30px">
									<Slide direction="right" in={true} style={{ position: "relative" }}>
										<IconBox onClick={() => {
											setCurDeliveryIndex(index)
											setShowDeliveryModal(true)
										}}
											className="hoverBaby"
											w='50px'
											h='50px'
											bg='linear-gradient(90deg, #4481EB 0%, #04BEFE 100%)'
											icon={<Icon w='28px' h='28px' as={delIcon} color='white' />}
											_hover={{ transform: 'scale(1.05)' }}
										/>
									</Slide>
								</Box>}

								{checkStatus() && <Slide direction="right" in={true} style={{ position: "relative" }}>
									<Flex alignItems="center" p="0px" mb="20px" pos="absolute" bottom={0} top="25px" right={0}>
										<IconButton icon={<DeleteIcon />}
											onClick={() => {
												setCurSelectedLoc(index)
												setShowDeleteShopModal(true)
											}}
										/>

										<Button onClick={() => setCurSelectedLoc(index)}
											bgColor='#01b574' color='white' variant='outline' borderRadius="15px"
											_hover={{ transform: 'scale(1.05)' }}
											width='160px' height="55px" my="0px" mx="10px" ml="40px"
										>
											{CurSelectedLoc?.id === item.id && !ShopLocations ? <Spinner color='#FFF' /> : 'Change Shop'}
										</Button>
									</Flex>
								</Slide>}
							</Card>
							:
							<Card flex={1} alignItems="center" maxWidth="500px" p="10px" my="15px">
								<Button onClick={() => setCurSelectedLoc(index)}
									bgColor='#01b574' color='white' variant='outline' borderRadius="15px"
									_hover={{ transform: 'scale(1.05)' }}
									width='200px' height="55px"
								>
									{CurSelectedLoc?.id === item.id && !ShopLocations ? <Spinner color='#FFF' /> : 'Assign Shop'}
								</Button>
							</Card>
						}
					</Flex>
				})}


				{OrderData.filesCount > 0 && <Card my="15px" mt="60px" w="400px"
					boxShadow={"0px 3px 20px rgba(112, 144, 176, 0.2)"}
					p="10px"
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


				<Flex justifyContent="center" my="10px" mt="60px">
					<Text style={{ color: "rgba(32, 76, 158, 1)", fontWeight: "700", fontSize: 15 }}>
						Order Created: {new Date(OrderData.created_at).toLocaleDateString() + "  " + new Date(OrderData.created_at).toLocaleTimeString()}
					</Text>

					<Text style={{ color: "rgba(32, 76, 158, 1)", fontWeight: "700", fontSize: 15, marginLeft: "30px" }}>
						({Cart?.order_details?.cart?.length} Items)
					</Text>
					<Text style={{ color: "rgba(32, 76, 158, 1)", fontWeight: "700", fontSize: 15, marginLeft: "15px" }}>
						₹ {Cart?.order_details?.totalCost}
					</Text>
				</Flex>

				{Cart?.order_details?.PrintingInstructions !== "" && <Card maxWidth="500px" p="10px" m="10px" borderRadius="7px"
					boxShadow={"0px 3px 20px rgba(0, 0, 0, 0.11)"} alignSelf="center"
				>
					<Text style={{ color: "rgba(32, 76, 158, 1)", fontWeight: "700", fontSize: 14 }} mb="5px">
						Printing Instructions :
					</Text>
					<Text style={{ fontWeight: "700", fontSize: 15 }} my="2px">
						{Cart?.order_details?.PrintingInstructions}
					</Text>
				</Card>}

				<Grid templateColumns={{ base: 'repeat(2, 1fr)' }} gap="50px">
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

			</Card>

			{/* Map */}
			{!ShowDeleteShopModal && CurSelectedLoc >= 0 && ShopLocations && <MapMultipleSelect assignShopCall={assignShopCall} userLocation={DeliveryLocations[CurSelectedLoc]} setCurSelectedLoc={setCurSelectedLoc}
				ShopLocations={ShopLocations} SelectedShop={SelectedShop} setSelectedShop={setSelectedShop} />
			}

			{/* Alert to delete a shop*/}
			<AlertDialog isOpen={ShowDeleteShopModal} onClose={() => {
				setCurSelectedLoc()
				setShowDeleteShopModal(false)
			}}>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogHeader fontSize='lg' fontWeight='bold'>
							Delete Shop
						</AlertDialogHeader>

						<AlertDialogBody>
							<span style={{ "white-space": "pre-line", fontWeight: "500" }}>
								Are you sure to remove this shop for this order?
							</span>
						</AlertDialogBody>

						<AlertDialogFooter>
							<Button onClick={() => {
								setCurSelectedLoc()
								setShowDeleteShopModal(false)
							}}>
								Cancel
							</Button>
							<Button colorScheme={'red'} onClick={() => assignShopCall(true)} ml={3}>
								Remove Shop
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>


			{/* Mark Delivered */}
			<AlertDialog isOpen={ShowDeliveryModal} onClose={() => {
				setCurSelectedLoc()
				setShowDeliveryModal(false)
			}}>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogHeader fontSize='lg' fontWeight='bold'>
							Mark Delivered?
						</AlertDialogHeader>

						<AlertDialogBody>
							<span style={{ "white-space": "pre-line", fontWeight: "500" }}>
								Are you sure to mark this order as delivered?
							</span>
						</AlertDialogBody>

						<AlertDialogFooter>
							<Button onClick={() => {
								setCurSelectedLoc()
								setShowDeliveryModal(false)
							}}>
								Cancel
							</Button>
							<Button colorScheme={'green'} onClick={() => markDeliverd()} ml={3}>
								Mark Delivered
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>

		</Card>
	);
}
