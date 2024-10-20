import React, { useState, useEffect, useMemo } from "react";
import { Box, Image, Text, IconButton, Flex } from "@chakra-ui/react";
import { useDispatch } from "react-redux";
import { debounce } from "lodash";
import { MinusIcon, DeleteIcon } from "@chakra-ui/icons";
import { deleteCart, updateCart } from "redux/Cart";

import PlusSvg from 'assets/img/svg/Plus.svg';

const CartItem = (props) => {
	const item = props.item;
	const dispatch = useDispatch();
	const [copies, setCopies] = useState(0);
	const handleRegionChange = debounce((temp) => dispatch(updateCart({ ...item, copies: temp })), 700);

	useEffect(() => {
		setCopies(item.copies);
	}, []);

	useEffect(() => {
		if (!copies || copies === item?.copies) return;
		handleRegionChange(copies);
	}, [copies, item?.copies]);

	const isImage = useMemo(() => {
		let fileExtension = item.uri.split('.').pop();
		if (['jpg', 'jpeg', 'heic', 'gif', 'png'].includes(fileExtension)) {
			return true;
		} else {
			return fileExtension;
		}
	}, [props.item]);


	return (
		<Box onClick={() => {
			props?.setItem({ ...item, isUpdate: true })
		}}
			boxShadow="lg"
			p={4}
			borderRadius="20px"
			overflow="hidden"
			margin={3}
			_hover={{ transform: "scale(1.02)", cursor: "pointer" }}
			transition="transform 0.2s"
		>
			<Flex direction="row">
				<Box p={1} marginX={4}>
					<Text fontFamily="DM sans" color="black" fontWeight="bold">
						{item?.name}
					</Text>

					<Flex direction="row" alignItems="center" mt="20px">
						<Text fontFamily="DM sans">
							Copies
						</Text>

						<IconButton
							aria-label="Decrease Copies"
							icon={<MinusIcon />}
							size="sm"
							onClick={(e) => {
								e.stopPropagation();
								let temp = copies - 1;
								if (temp < 1) {
									dispatch(deleteCart(item.id));
									return;
								}
								setCopies(temp);
							}}
							marginX={2}
						/>

						<Text mx={2} fontFamily="DM sans" color="#445">
							{copies}
						</Text>

						<IconButton
							aria-label="Increase Copies"
							icon={<Image src={PlusSvg} w="20px" h="20px" />}
							size="sm"
							onClick={(e) => {
								e.stopPropagation();
								let temp = copies + 1;
								if (temp > 500) return;
								setCopies(temp);
							}}
							marginX={2}
						/>
					</Flex>

					<Text fontFamily="DM sans" fontSize="sm">
						{`Pages: ${item.pages} , ${item.color} , ${item.size.name} , ${item.sides} , ${item.paper.name} , ${item.binding.name}`}
					</Text>
				</Box>

				<IconButton
					aria-label="Delete Item"
					icon={<DeleteIcon />}
					size="sm"
					onClick={(e) => {
						e.stopPropagation();
						dispatch(deleteCart(item.id));
					}}
					marginX={2}
				/>
			</Flex>
		</Box>
	);
};

export default CartItem;
