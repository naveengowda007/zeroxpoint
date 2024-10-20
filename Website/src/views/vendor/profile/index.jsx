import React, { useEffect, useState } from "react";
// Chakra imports
import {
	Box,
	FormControl,
	FormLabel,
	Input,
	Select,
	useToast,
	Button,
	Card,
	InputRightElement,
	InputGroup,
	Grid,
	Icon,
	Spinner
} from "@chakra-ui/react";
import { hpost, scrollTop, validateName } from "../../../res";

// Custom components
import Banner from "views/vendor/profile/components/Banner";

// Assets
import banner from "assets/img/auth/banner.png";
import avatar from "assets/img/profile/Project1.png";

import { RiEyeCloseLine } from "react-icons/ri";
import { MdOutlineRemoveRedEye } from "react-icons/md";

export default function Overview() {
	const toast = useToast();
	const [show, setShow] = React.useState(false)
	const handleClick = () => setShow(!show)

	const initialState = {
		bankOption: "upi",
		accountHolderName: '',
		accountNumber: "",
		ifscCode: "",
		upiId: "",
	};

	const [formData, setFormData] = useState(initialState);
	const [IsBankAPIloading, setIsBankAPIloading] = useState(false);
	const [OldPassword, setOldPassword] = useState("")
	const [NewPassword, setNewPassword] = useState("")
	const [ConfirmNewPassword, setConfirmNewPassword] = useState("")
	const [IsPasswordLoading, setIsPasswordLoading] = useState(false)

	// Chakra props
	const textColorSecondary = "gray.400";

	useEffect(() => {
		scrollTop()
	}, [])

	const showFillFieldsError = (title) => toast({
		title,
		status: 'warning',
		duration: 3000,
		isClosable: true,
	})

	function handlePasswordConfirm() {
		if (!OldPassword || !NewPassword || !ConfirmNewPassword) {
			showFillFieldsError('Fill all required fields!')
			return
		}

		if (NewPassword !== ConfirmNewPassword) {
			showFillFieldsError('New password does not match!')
			return
		}

		setIsPasswordLoading(true)

		// API call to change password
		hpost("/changePasswordVendor", { password: OldPassword, newPassword: NewPassword }, true)
			.then(res => {
				setIsPasswordLoading(false)
				toast({
					title: "Password changed successfully!",
					status: 'success',
					duration: 3000,
					isClosable: true,
				})
				setOldPassword("")
				setNewPassword("")
				setConfirmNewPassword("")
			}).catch(err => {
				console.log(err)
				setIsPasswordLoading(false)
				let title = "Password Update Failed"
				if (err.status === 401) {
					title = "Old Password Incorrect!"
				}
				toast({
					title,
					status: 'error',
					duration: 3000,
					isClosable: true,
				})
			})
	}

	const handleChange = (e) => {
		const { name, value } = e.target;
		if (name === "bankOption") {
			// Reset the form data for bank details when the option changes
			setFormData({
				...formData,
				bankOption: value,
				accountHolderName: "",
				accountNumber: "",
				ifscCode: "",
				upiId: "",
			});
			return
		}
		setFormData({ ...formData, [name]: value });
	};

	const checkForm = ([key, value]) => {
		if (key === "bankOption") {
			if (formData.bankOption === "upi" && (formData.upiId === "" || formData.upiId.length < 5)) return

			if (formData.bankOption !== "upi" && (!formData.accountHolderName || !validateName(formData.accountHolderName) || !formData.accountNumber || !formData.ifscCode)) return
		}

		return true
	}

	const handleBankChange = () => {
		if (!Object.entries(formData).every(checkForm)) {
			toast({
				description: "Fill all necessary fields",
				status: "warning",
				duration: 3000,
				isClosable: true,
			});
			return;
		}
		setIsBankAPIloading(true)

		// API call to change password
		hpost("/updateVendorPayment", formData, true)
			.then(res => {
				setIsBankAPIloading(false)
				toast({
					title: "Payment Info Updated!",
					status: 'success',
					duration: 3000,
					isClosable: true,
				})

				setTimeout(() => {
					window.location.reload()
				}, 2000);
			}).catch(err => {
				console.log(err)
				setIsBankAPIloading(false)
				let title = " Payment Info Update Failed!"
				toast({
					title,
					status: 'error',
					duration: 3000,
					isClosable: true,
				})
			})
	};

	const checkPassword = () => NewPassword && ConfirmNewPassword && NewPassword === ConfirmNewPassword

	return (
		<Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
			{/* Main Fields */}
			<Banner
				gridArea='1 / 1 / 2 / 2'
				banner={banner}
				avatar={avatar}
			/>

			<Grid templateColumns={{
				base: 'repeat(2, 1fr)',
			}} justifyItems="center" alignSelf="center" px="100px">

				{/* Change Bank Details */}
				<Card px='4' py='15px' w='400px' boxShadow='lg' borderRadius='xl' mb='20px'>
					<Box pb="10px" style={{ fontFamily: 'DM Sans', minWidth: "150px", fontWeight: "500" }}>
						Change Bank Details
					</Box>

					<FormControl>
						<FormLabel>Bank Details</FormLabel>
						<Select
							name="bankOption"
							value={formData.bankOption}
							onChange={handleChange}
							required
						>
							<option value="account">Account</option>
							<option value="upi">UPI</option>
						</Select>

						{formData.bankOption === "account" && (<>
							<FormControl id="accounHolderName" mt={2} mb={2}>
								<FormLabel>Account Holder Name:</FormLabel>
								<Input
									type="text"
									name="accountHolderName"
									value={formData.accountHolderName}
									onChange={handleChange}
									placeholder="Account Holder Name"
								/>
							</FormControl>

							<FormControl id="accountNumber" mt={2} mb={2}>
								<FormLabel>Account Number:</FormLabel>
								<Input
									type="number"
									name="accountNumber"
									value={formData.accountNumber}
									onChange={handleChange}
									placeholder="Accountnumber (without spaces,e.g.,XXXXXXXXXXXXXXXXX)"
								/>
							</FormControl>

							<FormControl id="ifscCode" mb='10px'>
								<FormLabel>IFSC Code:</FormLabel>
								<Input
									type="text"
									name="ifscCode"
									value={formData.ifscCode}
									onChange={handleChange}
									placeholder="Enter your IFSC Code"
								/>
							</FormControl>
						</>)}
						{formData.bankOption === "upi" && ( //minimum 3 characters and maximum 50 characters. It cannot contain any special characters except (dot)
							<FormControl id="upiId" mt={2} mb={2}>
								<FormLabel>UPI ID:</FormLabel>
								<Input
									type="text"
									name="upiId"
									value={formData.upiId}
									onChange={handleChange}
								/>
							</FormControl>
						)}
					</FormControl>

					<Button onClick={handleBankChange} boxShadow={"0px 18px 40px rgba(112, 144, 176, 0.12)"}
						bgColor='#59BA41' color='white' variant='solid' borderRadius="lg"
						_hover={{ transform: 'scale(1.05)' }}
						_active={{ transform: 'scale(0.95)' }} mt='10px' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} w='full'
					>
						Update Payment Details {IsBankAPIloading && <Spinner ml="15px" color='#FFF' />}
					</Button>
				</Card>

				{/* Change Password */}
				<Card px='4' py='15px' w='400px' boxShadow='lg' borderRadius='xl' mb='20px' h="fit-content">
					<Box pb="10px" style={{ fontFamily: 'DM Sans', minWidth: "150px", fontWeight: "500" }}>
						Change Password
					</Box>

					<form>
						<InputGroup size='md' mb='25px'>
							<Input value={OldPassword}
								onChange={(e) => setOldPassword(e.target.value)}
								pr='4.5rem'
								type={show ? 'text' : 'password'}
								placeholder='Enter Old Password'
								border='1px'
								borderRadius='lg'
							/>
							<InputRightElement width='3rem'>
								<Icon
									color={textColorSecondary}
									_hover={{ cursor: "pointer" }}
									as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
									onClick={handleClick}
								/>
							</InputRightElement>
						</InputGroup>

						<InputGroup size='md' mb='10px'>
							<Input value={NewPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								pr='4.5rem'
								type={show ? 'text' : 'password'}
								placeholder='Enter New Password'
								border='1px'
								borderRadius='lg'
							/>
							<InputRightElement width='3rem'>
								<Icon
									color={textColorSecondary}
									_hover={{ cursor: "pointer" }}
									as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
									onClick={handleClick}
								/>
							</InputRightElement>
						</InputGroup>

						<InputGroup size='md' mb='15px'>
							<Input value={ConfirmNewPassword}
								onChange={(e) => setConfirmNewPassword(e.target.value)}
								pr='4.5rem'
								type={show ? 'text' : 'password'}
								placeholder='Confirm New Password'
								border='1px'
								borderRadius='lg'
								{...checkPassword() && { focusBorderColor: 'green' }}
							/>
							<InputRightElement width='3rem'>
								<Icon
									color={textColorSecondary}
									_hover={{ cursor: "pointer" }}
									as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
									onClick={handleClick}
								/>
							</InputRightElement>
						</InputGroup>

						<Button onClick={handlePasswordConfirm} type="submit" boxShadow={"0px 18px 40px rgba(112, 144, 176, 0.12)"}
							bgColor='#59BA41' color='white' variant='solid' borderRadius="lg"
							_hover={{ transform: 'scale(1.05)' }}
							_active={{ transform: 'scale(0.95)' }} mt='10px' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} w='full'
						>
							Change Password {IsPasswordLoading && <Spinner ml="15px" color='#FFF' />}
						</Button>
					</form>
				</Card>
			</Grid>
		</Box>
	);
}
