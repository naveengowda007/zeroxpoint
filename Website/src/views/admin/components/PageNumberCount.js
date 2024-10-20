import React from 'react';
import { ButtonGroup, Button, Text, Flex } from '@chakra-ui/react';

const PageNumberCount = ({ CurrentPage, setCurrentPage, totalPages }) => {
	const handlePageChange = (pageNumber) => {
		setCurrentPage(pageNumber);
	};

	const renderPageNumbers = () => {
		const pageNumbers = [];


		for (let i = 1; i <= totalPages; i++) {
			const backGroundColor = i !== CurrentPage ? { bg: '#fff' } : {}

			pageNumbers.push(
				<Button
					{...backGroundColor}
					key={i}
					size="sm"
					colorScheme="telegram"
					variant={i === CurrentPage ? 'solid' : 'outline'}
					onClick={() => handlePageChange(i)}
					borderRadius="50px"
				>
					{i}
				</Button >
			);
		}

		return pageNumbers;
	};

	return (
		<Flex mt="40px" alignItems={"center"} direction={"column"}>
			<ButtonGroup spacing={2}>
				{renderPageNumbers()}
			</ButtonGroup>
			<Text fontSize="sm" mt={2}>
				Page {CurrentPage} of {totalPages}
			</Text>
		</Flex>
	);
};

export default PageNumberCount;
