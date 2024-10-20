import React, { useState, useEffect } from "react";
// Chakra imports
import { Box, Input, InputGroup, InputRightElement, Button, Card, useToast, Icon, Spinner } from "@chakra-ui/react";
import { hpost, scrollTop } from "res";

// Custom components
import Banner from "views/admin/profile/components/Banner";

// Assets
import banner from "assets/img/auth/banner.png";
import avatar from "assets/img/profile/Project1.png";
import { RiEyeCloseLine } from "react-icons/ri";
import { MdOutlineRemoveRedEye } from "react-icons/md";

export default function Overview() {
	const toast = useToast()
	const [OldPassword, setOldPassword] = useState("")
	const [NewPassword, setNewPassword] = useState("")
	const [ConfirmNewPassword, setConfirmNewPassword] = useState("")
	const [IsPasswordLoading, setIsPasswordLoading] = useState(false)

	const [show, setShow] = React.useState(false)
	const handleClick = () => setShow(!show)

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
		hpost("/changePasswordAdmin", { password: OldPassword, newPassword: NewPassword }, true)
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
				let title = "Password Update failed"
				if (err.status === 401) {
					title = "Old password incorrect!"
				}
				toast({
					title,
					status: 'error',
					duration: 3000,
					isClosable: true,
				})
			})
	}

	const checkPassword = () => NewPassword && ConfirmNewPassword && NewPassword === ConfirmNewPassword

	return (
		<Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
			{/* Main Fields */}
			<Banner
				gridArea='1 / 1 / 2 / 2'
				banner={banner}
				avatar={avatar}
			/>

			{/* Change Password */}
			<Card mx="auto" px='4' py='15px' w='400px' boxShadow='lg' borderRadius='xl' mb='20px' h="fit-content">
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
		</Box>
	);
}
