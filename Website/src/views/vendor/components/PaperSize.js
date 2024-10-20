import React from "react";
import {
	Table,
	Thead,
	Tr,
	Th,
	Tbody,
	Td,
	Input,
	Box,
	useColorModeValue,
} from "@chakra-ui/react";
import Card from 'components/card/Card';
import { handleNumericScroll } from "res";

const PaperSize = ({ PaperSizeData, setPaperSizeData, paperTypes, isReadOnly }) => {

	const textColor = useColorModeValue("secondaryGray.900", "white");
	const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");

	const handleInputChange = (id, field, value) => {
		const updatedPaperSizes = PaperSizeData.map((paperSize) => {
			if (paperSize.id !== id) {
				return paperSize
			}

			if (field === "paperType") {
				let data = paperTypes.find(item => {
					value = parseInt(value)
					return item.id === value
				})
				return { ...paperSize, [field]: data }
			}

			return { ...paperSize, [field]: value }
		});
		setPaperSizeData(updatedPaperSizes);
	};

	const RenderPaperSizes = (paperSize) => {
		return <Tr key={paperSize.id}>
			<Td width="120px">
				<Box
					fontSize="15px"
					placeholder="Paper Size"
					fontFamily='sans-serif'
					color="#000"
					justifyItems="center"
					textAlign="center"
				>
					{paperSize.name}
				</Box>
			</Td>

			{/* Paper Type */}
			<Td width="150px" >
				<Box
					fontSize="15px"
					placeholder="Paper Size"
					fontFamily='sans-serif'
					color="#000"
					justifyItems="center"
					textAlign="center"
				>
					{paperSize.paperType?.name}
				</Box>
			</Td>
			<Td isNumeric width="200px">
				<Input isReadOnly={isReadOnly}
					fontSize="15px"
					type="number"
					value={paperSize.bwSingleSide}
					onChange={(e) => handleInputChange(paperSize.id, "bwSingleSide", e.target.value)}
					border='1px'
					borderColor='black'
					fontFamily='sans-serif'
					onWheel={handleNumericScroll}
				/>
			</Td>
			<Td isNumeric width="200px">
				<Input isReadOnly={isReadOnly}
					fontSize="15px"
					type="number"
					value={paperSize.bwDoubleSide}
					onChange={(e) => handleInputChange(paperSize.id, "bwDoubleSide", e.target.value)}
					border='1px'
					borderColor='black'
					fontFamily='sans-serif'
					onWheel={handleNumericScroll}
				/>
			</Td>
			<Td isNumeric width="200px">
				<Input isReadOnly={isReadOnly}
					fontSize="15px"
					type="number"
					value={paperSize.colorSingleSide}
					onChange={(e) => handleInputChange(paperSize.id, "colorSingleSide", e.target.value)}
					border='1px'
					borderColor='black'
					fontFamily='sans-serif'
					onWheel={handleNumericScroll}
				/>
			</Td>
			<Td isNumeric width="200px">
				<Input isReadOnly={isReadOnly}
					fontSize="15px"
					type="number"
					value={paperSize.colorDoubleSide}
					onChange={(e) => handleInputChange(paperSize.id, "colorDoubleSide", e.target.value)}
					border='1px'
					borderColor='black'
					fontFamily='sans-serif'
					onWheel={handleNumericScroll}
				/>
			</Td>
		</Tr>
	};

	return (
		<>
			<Box fontSize="17px">
				<div style={{ display: "flex", alignItems: "center" }}>
					<span style={{ marginRight: "15px", fontFamily: 'DM Sans', marginBottom: '15px', minWidth: "150px", fontWeight: "500" }}>
						Paper Size :
					</span>
				</div>
			</Box>


			<Card direction='column'
				w='90%'
				px='20px'
				py='10px'
				style={{ minHeight: 50 }}>
				<Table variant="simple" color='gray.500' mb='15px'>
					<Thead >
						<Tr pe='10px'>
							<Th color={textColor} borderColor={borderColor} fontFamily='DM Sans' textAlign="center"> Name</Th>
							<Th color={textColor} borderColor={borderColor} fontFamily='DM Sans' textAlign="center">Paper Type</Th>
							<Th color={textColor} borderColor={borderColor} fontFamily='DM Sans' textAlign="center">B/W Single Side</Th>
							<Th color={textColor} borderColor={borderColor} fontFamily='DM Sans' textAlign="center">B/W Double Side</Th>
							<Th color={textColor} borderColor={borderColor} fontFamily='DM Sans' textAlign="center">Color Single Side</Th>
							<Th color={textColor} borderColor={borderColor} fontFamily='DM Sans' textAlign="center">Color Double Side</Th>
						</Tr>
					</Thead>
					<Tbody>
						{PaperSizeData.map((paperSize) => RenderPaperSizes(paperSize))}
					</Tbody>
				</Table>
			</Card>
		</>
	);
};

export default PaperSize;
