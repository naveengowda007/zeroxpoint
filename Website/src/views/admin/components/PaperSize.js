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
	IconButton,
	useColorModeValue,
	Select,
} from "@chakra-ui/react";
import { DeleteIcon, AddIcon, } from "@chakra-ui/icons";
import Card from 'components/card/Card';
import { handleNumericScroll } from "res";

const PaperSize = ({ PaperSizeData, setPaperSizeData, paperTypes }) => {

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

	const handleAddPaperSize = () => {
		const newId = PaperSizeData.length + 1;
		const newPaperSize = { id: newId, name: "", paperType: null, bwSingleSide: "", bwDoubleSide: "", colorSingleSide: "", colorDoubleSide: "" };
		if (paperTypes.length > 0) {
			newPaperSize.paperType = paperTypes[0]
		}
		setPaperSizeData([...PaperSizeData, newPaperSize]);
	};

	const handleRemovePaperSize = (id) => {
		const updatedPaperSizes = PaperSizeData.filter((paperSize) => paperSize.id !== id);
		setPaperSizeData(updatedPaperSizes);
	};

	const RenderPaperSizes = (paperSize) => {
		return <Tr key={paperSize.id}>
			<Td width="200px">
				<Input minW="100px"
					fontSize="15px"
					value={paperSize.name}
					onChange={(e) => handleInputChange(paperSize.id, "name", e.target.value)}
					border='1px'
					borderColor='black'
					placeholder="Paper Size"
					fontFamily='sans-serif'
				/>
			</Td>

			{/* Paper Type */}
			<Td width="210px">
				<Select minWidth="120px" variant='filled' color="#000"
					name="paperType"
					value={paperSize.paperType?.id}
					onChange={(e) => handleInputChange(paperSize.id, "paperType", e.target.value)}
					required
				>
					{paperTypes.map(item => item.name && <option value={item.id} key={item.id}>{item.name}</option>)}
				</Select>
			</Td>
			<Td isNumeric width="200px">
				<Input
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
				<Input
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
				<Input
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
				<Input
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
			{paperSize.id === 1 ? <Box mt="18px" ml="-15px" mr="10px" width={"41px"} />
				: (<Box mt="18px" ml="-15px" mr="10px">
					<IconButton
						icon={<DeleteIcon />}
						onClick={() => handleRemovePaperSize(paperSize.id)}
					/>
				</Box>)}
		</Tr>
	};

	return (
		<div>
			<Box mt="40px" fontSize="17px"  >
				<div style={{ display: "flex", alignItems: "center" }}>
					<span style={{ marginRight: "15px", fontFamily: 'DM Sans', marginBottom: '15px', minWidth: "150px", fontWeight: "500" }}>Paper Size : </span>
				</div>
			</Box>


			<Card direction='column'
				w='fit-content'
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
				<Box textAlign="center">
					<IconButton
						textColor={textColor}
						fontSize="20px"
						icon={<AddIcon />}
						onClick={handleAddPaperSize}
					/>
				</Box>
			</Card>
		</div>
	);
};

export default PaperSize;
