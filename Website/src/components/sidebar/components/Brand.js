import React from "react";

// Chakra imports
import { Flex } from "@chakra-ui/react";

// Custom components
import { HSeparator } from "components/separator/Separator";

export function SidebarBrand() {
	return (
		<Flex align='center' direction='column'>
			<a href="/#/admin/dashboard" style={{ fontFamily: 'DM Sans', fontWeight: "bold", marginBottom: "15px", fontSize: "25px" }}>ZEROXPOINT</a>
			<HSeparator mb='20px' />
		</Flex>
	);
}

export default SidebarBrand;
