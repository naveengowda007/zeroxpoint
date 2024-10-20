import React, { useState, useEffect, useRef, useMemo } from "react";
import { Box, Image, Spinner, VStack, Card, useColorModeValue, Flex, Text, useToast, Button, IconButton, HStack, Textarea } from "@chakra-ui/react";
import { API_URL_USER, JWT_TOKEN, USER_ID, genTxId, scrollTop, upost } from "res";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

// Assets
import NoOrderPng from 'assets/img/Intro1.png'
import UploadFilesBanner from "./components/UploadBanner";
import InfoSvg from 'assets/img/icons/Info.svg';
import CartItem from "./components/CartItem";
import AddAddress from "./components/AddAddress";
import DeliveryLocationCard from "./components/DeliveryLocationCard";
import { resetCart, setNewCart } from "redux/Cart";
import { ChevronDownIcon } from "@chakra-ui/icons";

export default function CartScreen(props) {
	const shadow = useColorModeValue(
		'14px 17px 40px 4px rgba(112, 144, 176, 0.18)',
		'14px 17px 40px 4px rgba(112, 144, 176, 0.06)'
	);

	const CartData = useSelector((state) => {
		return state.Cart;
	});

	// User Data State
	const UserData = useSelector((state) => {
		return state.UserData;
	});

	const toast = useToast()
	const dispatch = useDispatch()
	const history = useHistory()

	const PayNowCartId = useRef("")
	const [IsLoading, setIsLoading] = useState(false);
	const [transactionId, setTransactionId] = useState()
	const [DeliveryLocation, setDeliveryLocation] = useState([])
	const [cartPrice, setCartPrice] = useState(null);
	const [DeliveryCharge, setDeliveryCharge] = useState(null)
	const [PrintingInstructions, setPrintingInstructions] = useState("")
	const [PriceUpdate, setPriceUpdate] = useState(false)
	const [ExpandBill, setExpandBill] = useState(false)
	const [Item, setItem] = useState({})

	const isScrolled = useRef(true)
	const [files, setFiles] = useState([])

	useEffect(() => {
		dispatch(resetCart())
	}, [])

	useEffect(() => {
		if (PriceUpdate) {
			setPriceUpdate(false);
			return
		}

		if (isScrolled.current) {
			scrollTop()
			isScrolled.current = false;
		}


		let transactionId = genTxId()
		setTransactionId(transactionId)
		setCartPrice(null)
		setDeliveryCharge(null)
		setIsLoading(false)
		// console.log(transactionId);
	}, [CartData, DeliveryLocation])


	function handlePayNow() {
		setIsLoading(true)
		handleAfterPaymentSuccess()

		// ! Payment Function

		// let priceString = String(cartPrice)

		// initiateTransaction({
		// 	upi: 'zeroxpoint@ybl',  // Required
		// 	payeeName: 'ZeroxPoint', // Required 
		// 	transactionId: transactionId,  // Required
		// 	currency: 'INR',   //(Required)
		// 	merchantCategoryCode: 'Main',  // (Required)      
		// 	amount: priceString,  // Required
		// 	note: transactionId, // (Optional)
		// })
		// 	.then((res) => {
		// 		// console.log(res);
		// 		if (res.message === "SUCCESS") {
		// 			handleAfterPaymentSuccess()
		// 			return
		// 		}

		// 		setIsLoading(false)
		// 		toast({
		// 			title: "Payment failed on previous order!",
		// 			status: 'error',
		// 			duration: 3000,
		// 			isClosable: true,
		// 		})
		// 	})
		// 	.catch((e) => {
		// 		setIsLoading(false)
		// 		console.log("Payment Error: ", e);
		// 		toast({
		// 			title: "Payment failed on previous order!",
		// 			status: 'error',
		// 			duration: 3000,
		// 			isClosable: true,
		// 		})
		// 	});
	}

	function handleAfterPaymentSuccess() {
		setIsLoading(true)
		upost("/order", { cartid: PayNowCartId.current, DeliveryLocation }, true)
			.then(res => {
				// console.log(res);
				setIsLoading(false)
				toast({
					status: "success",
					title: "Order Successful!",
					description: "Your order is being processed",
					duration: 3000,
					isClosable: true,
				})

				dispatch(resetCart())
				history.push("/user/orders")
			})
			.catch(err => {
				setIsLoading(false)
				console.log("After Payment error", err)
				toast({
					status: "error",
					title: "Failed to place order!",
					description: "Please try again",
					duration: 3000,
					isClosable: true,
				});
			})
	}

	function getCartPrice() {
		setPriceUpdate(true)

		upost("/cart/getPrice", { cartid: transactionId, CartData, DeliveryLocation, PrintingInstructions }, true)
			.then(res => {
				// console.log(res);
				const { cart, totalCost, cartid, DeliveryCharge } = res
				PayNowCartId.current = cartid
				dispatch(setNewCart(cart))
				setDeliveryCharge(DeliveryCharge)
				setCartPrice(totalCost)
				setIsLoading(false)
			})
			.catch(err => {
				setIsLoading(false)
				console.log(err);
				toast({
					status: 'error',
					title: "Error Fetching Price!",
					description: "Please try again",
					duration: 3000,
					isClosable: true,
				})
			})
	}

	async function uploadFile(item, index) {
		const formData = new FormData();
		formData.append('file', files[index]);
		try {
			const response = await fetch(`${API_URL_USER}/cart/upload`, {
				method: 'POST',
				body: formData,
				headers: {
					jwt: JWT_TOKEN,
					userid: USER_ID,
					cartid: transactionId
				},
			});

			if (!response.ok) {
				throw new Error('Network response.');
			}

			const data = await response.json();
			return data;
		} catch (error) {
			console.error('Error in uploding files.', error);
		}
	}

	async function uploadAndGetPrice() {
		if (!UserData.name) {
			toast({
				status: "info",
				title: "Please add your details.",
				position: "bottom",
			});
			history.push("/user/profile")
			return
		}

		if (!DeliveryLocation || DeliveryLocation.length === 0) {
			toast({
				status: "error",
				title: "Add a delivery location!",
				description: "Select atleast one location",
				duration: 3000,
				isClosable: true,
			});
			return
		}

		setCartPrice(null)
		setIsLoading(true)

		Promise.all(CartData.map((item, index) => uploadFile(item, index)))
			.then(res => {
				setIsLoading(false)

				if (res.length > 0 && res.every(item => item?.success)) {
					getCartPrice()
				}
				else {
					// dispatch(resetCart())
					toast({
						status: "error",
						title: "Error uploading files!",
						description: "Please try again",
						duration: 3000,
						isClosable: true,
					});
				}
			})
			.catch(error => {
				console.log(error);
				toast({
					status: "error",
					title: "Error uploading files!",
					description: "Please try again",
					duration: 3000,
					isClosable: true,
				});
				dispatch(resetCart())
				setIsLoading(false)
			})
	}

	const RenderCart = useMemo(() => {
		return CartData.map(item => <CartItem item={item} key={JSON.stringify(item)} setItem={setItem} />)
	}, [CartData, setItem])

	return (
		<Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
			<Card
				direction='column'
				w='100%'
				px='0px'
				mb="20px"
				overflowX={{ sm: "scroll", lg: "hidden" }}
				fontFamily="DM Sans"
				boxShadow={shadow}
				borderRadius="7px"
			>
				<UploadFilesBanner isCartScreen files={files} setFiles={setFiles} Item={Item} setItem={setItem} dispatch={dispatch} />
			</Card>

			<Card alignItems="center" justifyContent="center"
				borderRadius="20px"
				direction='column'
				w='100%'
				px='0px'
				overflowX={{ sm: "scroll", lg: "hidden" }}
				style={{ minHeight: 400 }}
				fontFamily="DM Sans"
			>
				{
					CartData?.length === 0 ?

						<VStack spacing={4} align="center">
							<Image src={NoOrderPng} w="220px" objectFit="contain" mt={4} mb={4} alt="No Order" sx={props.NoOrderPngStyle} />
							<Box color="orange.500" mt={4} fontSize="lg" textAlign="center">
								No items in the cart yet!
							</Box>
						</VStack>

						:

						<Flex gap={10} mt={2}>
							<VStack gap={7} alignItems="center">
								<Text fontWeight="500" fontFamily="DM sans" color="black" m={4} mb={-3}>Documents:</Text>
								{RenderCart}
							</VStack>

							<VStack align="center" w="full" maxW="550px" spacing={4}>
								<Text fontWeight="500" fontFamily="DM sans" color="black" m={4} mb={2}>Delivery Address:</Text>
								{DeliveryLocation?.length > 0 && <Text fontSize="sm" fontWeight="500" fontFamily="DM sans" color="orange.300" mb={-4}>(Tap to change address)</Text>}

								<DeliveryLocationCard setDeliveryLocation={setDeliveryLocation} />

								{DeliveryLocation?.length < 1 && <AddAddress height={115} setOpenLocationModal={() => history.push("/user/profile?addAddress=true")} />}

								<Box bg="white" borderRadius="xl" overflow="hidden" boxShadow="lg" p={2} w="100%" mt="10px">
									<Textarea
										height="130px"
										placeholder={`Enter Printing Instructions: (optional)\n\nEx:\nPlace all files in a single spiral binding\nDeliver 3 copies to House 1, and rest to House 2`}
										value={PrintingInstructions}
										onChange={(e) => setPrintingInstructions(e.target.value)}
										minH={"120px"}
										maxH={"180px"}
										maxLength={255}
									/>
								</Box>

								<Button flexDirection="row" alignItems="center" my={4} ml={4} px={4} py={2} borderRadius="md" borderColor="gray.300" borderWidth={1} onClick={() => history.push("/user/calculate")
								}>
									<Image src={InfoSvg} w="22px" h="22px" />
									<Text fontFamily="DM sans" color="black" px={4}>Go to price calculator</Text>
								</Button>

								{cartPrice === null && (
									<Box w="full" justifyContent="center" alignItems="center" borderRadius={8} overflow="hidden">
										<Flex bgGradient="linear(to-l, #d4fc79, #96e6a1)" p={5}
											style={{ maxWidth: 600, flex: 1, justifyContent: "center", opacity: 0.95 }}
										>
											<Button
												onClick={uploadAndGetPrice}
												isDisabled={IsLoading || cartPrice !== null}
												alignItems="center"
												paddingVertical={10}
												borderRadius="50px"
												overflow="hidden"
												background="linear-gradient(180deg, #f46b45, #ffe259)"
												_hover={{ transform: 'scale(1.05)' }}
											>
												{IsLoading ? <Spinner color="white" /> : <Text color="#eff" fontFamily="DM sans">Upload Files to Get Price</Text>}
											</Button>
										</Flex>
									</Box>
								)}

								{cartPrice !== null && (
									<Box w="full" justifyContent="center" alignItems="center" borderRadius={8} overflow="hidden">
										<Box bgGradient="linear(to-l, #d4fc79, #96e6a1)"
											style={{ maxWidth: 600, flex: 1 }} pt={2}
										>
											{ExpandBill && (
												<Box boxShadow="lg" borderRadius="lg" bg="white" p={4} pb={6} m={2}>
													<Text fontWeight="500" fontFamily="DM sans" mb={4}>Printing Charge: ₹ {cartPrice - (DeliveryLocation.length * DeliveryCharge)}</Text>
													<Text fontWeight="500" fontFamily="DM sans">Delivery Charge: ₹ {DeliveryCharge} ({DeliveryLocation.length} {DeliveryLocation.length > 1 ? "locations" : "location"})</Text>
												</Box>
											)}

											<HStack spacing={4} alignItems="center" justifyContent="space-between" p={4}>
												<IconButton
													aria-label="Toggle bill details"
													icon={<ChevronDownIcon transform={ExpandBill ? "rotate(0deg)" : "rotate(180deg)"} />}
													onClick={() => setExpandBill(val => !val)}
												/>

												<Text fontFamily="DM sans" fontWeight="bold" mr={4}>Total: ₹ {cartPrice}</Text>

												<Button title="Expand Bill"
													onClick={handlePayNow}
													isDisabled={IsLoading}
													height="40px"
													alignItems="center"
													marginRight={4}
													borderRadius="50px"
													overflow="hidden"
													background="linear-gradient(180deg, #f46b45, #ffe259)"
													_hover={{ transform: 'scale(1.05)' }}
												>
													{IsLoading ? <Spinner color="white" /> : <Text color="#eff" fontFamily="DM sans" px="10px">
														Pay Now
													</Text>}
												</Button>
											</HStack>
										</Box>
									</Box>
								)}

								<Text fontFamily="DM sans" color="red.500" m={4} fontSize="sm">
									{"Note:\nIf Payment failed on any order, but the amount has been debited!\nDo not worry, Call us anytime from the side menu.\nAnd we will sort it right away!.\n\nIf you need binding for all the uploaded files, select the binding for any one of the files and selelct 'No Binding' for the rest. Kindly mention the preference in the Printing Instructions."}
								</Text>
							</VStack>
						</Flex>
				}
			</Card>
		</Box>
	);
}
