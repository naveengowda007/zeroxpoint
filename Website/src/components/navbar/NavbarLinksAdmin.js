import React, { useState } from 'react';
// Chakra Imports
import {
	Avatar,
	Box,
	Card,
	Flex,
	Image,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	Text,
	useColorModeValue
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useHistory } from "react-router-dom";
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { debounce } from 'lodash';

// Custom Components
import { SearchBar } from 'components/navbar/searchBar/SearchBar';
import { SidebarResponsive } from 'components/sidebar/Sidebar';
import { logout } from 'Utils/auth';
import { formatDate, hpost } from 'res';
import storePNG from 'assets/img/store.png'
// Assets

export default function HeaderLinks(props) {
	const UserData = useSelector((state) => state.UserData);
	const { secondary, routes } = props;

	// States
	const [SearchData, setSearchData] = useState([])

	// Chakra Color Mode
	let menuBg = useColorModeValue('white', 'navy.800');
	const textColor = useColorModeValue('secondaryGray.900', 'white');
	const borderColor = useColorModeValue('#E6ECFA', 'rgba(135, 140, 189, 0.3)');
	const shadow = useColorModeValue(
		'14px 17px 40px 4px rgba(112, 144, 176, 0.18)',
		'14px 17px 40px 4px rgba(112, 144, 176, 0.06)'
	);

	const history = useHistory()

	const getSearchDetails = debounce(value => {
		if (!value) {
			setSearchData([])
			return
		}
		hpost(UserData.type === 'vendor' ? "/search4Vendor" : "/search", { value }, true)
			.then(res => {
				setSearchData(res);
			}).catch(e => {
				console.log(e);
			})
	}, 800);

	const RenderSearchData = (item, index) => {
		const isShop = item?.vendor_name

		const onPress = () => {
			if (isShop) {
				history.push(`/admin/vendors?id=${item?.userid}`)
			} else if (item?.userid) {
				history.push(`/admin/users?id=${item?.userid}`)
			} else {
				history.push(`/admin/orders?id=${item?.id}`)
			}
		}

		if (item?.userid) {
			return <Card onClick={onPress} style={{ width: 200, paddingVerical: "25px" }} my="5px" p="5px" borderRadius="3px" key={item?.id || item?.userid} className="hoverBaby">
				<Flex>
					<Box style={{ flex: 1 }}>
						<Box style={{ flex: 1, fontFamily: 'DM Sans', fontWeight: "500", fontSize: "14px", lineHeight: "18px" }}>
							{item?.name || item?.vendor_name || "User"}
						</Box>
						{isShop && <Box style={{ flex: 1, fontFamily: 'DM Sans', fontWeight: "500", fontSize: "11px", lineHeight: "18px" }}>
							{item?.shop_name}
						</Box>}
						<Box style={{ flex: 1, fontFamily: 'DM Sans', fontWeight: "500", fontSize: "12px", lineHeight: "18px" }}>
							{item?.phone}
						</Box>
					</Box>
					{isShop && <Image src={storePNG} width={"25px"} height={"25px"} />}
				</Flex>
			</Card>
		}

		return <Card onClick={onPress} style={{ width: 200, paddingVerical: "25px" }} my="5px" p="5px" borderRadius="3px" key={item?.id || item?.userid} className="hoverBaby">
			<Box style={{ flex: 1, fontFamily: 'DM Sans', fontWeight: "500", fontSize: "14px", lineHeight: "18px" }}>
				Order ID: #ZP0{item?.id}
			</Box>

			<Box style={{ flex: 1, fontFamily: 'DM Sans', fontWeight: "500", fontSize: "12px", lineHeight: "18px" }}>
				{formatDate(item?.created_at)}
			</Box>
		</Card>
	}

	return (
		<Flex
			w='100%'
			alignItems="center"
			flexDirection="row"
			bg={menuBg}
			flexWrap={secondary ? { base: 'wrap', md: 'nowrap' } : 'unset'}
			p="10px"
			borderRadius="30px"
			boxShadow={shadow}>

			<SearchBar mb={secondary ? { base: '10px', md: 'unset' } : 'unset'} me="10px" borderRadius="30px"
				onChange={getSearchDetails} setSearchData={setSearchData} />

			{SearchData?.length > 0 && <Card style={{ position: 'absolute', overflow: 'scroll', zIndex: 99, minHeight: "20vh", maxHeight: "80vh" }} boxShadow={"0px 3px 10px rgba(0, 0, 0, 0.2)"}>
				{SearchData.map(RenderSearchData)}
			</Card>}

			<SidebarResponsive routes={routes} />

			<Menu>
				<MenuButton p="0px">
					<Avatar
						_hover={{ cursor: 'pointer' }}
						color="white"
						name={UserData.type === "admin" ? "Admin" : UserData.name}
						bg="#11047A"
						size="sm"
						w="40px"
						h="40px"
					/>
				</MenuButton>

				<MenuList boxShadow={shadow} p="0px" mt="10px" borderRadius="20px" bg={menuBg} border="none">
					<Flex w="100%" mb="0px">
						<Text
							ps="20px"
							pt="16px"
							pb="10px"
							w="100%"
							borderBottom="1px solid"
							borderColor={borderColor}
							fontSize="sm"
							fontWeight="700"
							color={textColor}>
							👋&nbsp; Hey, {UserData.type === "admin" ? "Admin" : UserData.name}
						</Text>
					</Flex>
					<Flex flexDirection="column" p="10px">
						<MenuItem _hover={{ bg: 'none' }} _focus={{ bg: 'none' }} borderRadius="8px" px="14px">
							<NavLink to={UserData?.type === "user" ? '/user/profile' : '/admin/profile'}>
								<Text fontSize="sm">Profile Settings</Text>
							</NavLink>
						</MenuItem>

						<MenuItem
							_hover={{ bg: 'none' }}
							_focus={{ bg: 'none' }}
							color="red.400"
							borderRadius="8px"
							px="14px"
							onClick={() => logout(history)}>
							<Text fontSize="sm">Log out</Text>
						</MenuItem>
					</Flex>
				</MenuList>
			</Menu>
		</Flex>
	);
}

HeaderLinks.propTypes = {
	variant: PropTypes.string,
	fixed: PropTypes.bool,
	secondary: PropTypes.bool,
	onOpen: PropTypes.func
};
