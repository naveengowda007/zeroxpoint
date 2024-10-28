/*eslint-disable*/
import React from "react";
import {
  Flex,
  Link,
  List,
  ListItem,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";

export default function Footer() {
  let textColor = useColorModeValue("gray.400", "white");
  let linkColor = useColorModeValue({ base: "gray.400", lg: "white" }, "white");

  return (
    <Flex
      zIndex="3"
      flexDirection={{
        base: "column",
        lg: "row",
      }}
      alignItems={{
        base: "center",
        xl: "start",
      }}
      justifyContent="space-between"
      px={{ base: "30px", md: "0px" }}
      pb="30px"
    >
      <Text
        color={textColor}
        textAlign={{
          base: "center",
          xl: "start",
        }}
        mb={{ base: "20px", lg: "0px" }}
      >
        Copyright &copy; {1900 + new Date().getYear()}
        <Text as="span" fontWeight="500" ms="4px">
          <Link
            mx="3px"
            color={textColor}
            href="https://www.zeroxpoint.com"
            target="_blank"
            fontWeight="700"
          >
            ZEROXPOINT
          </Link>
        </Text>
        <br />
        <Text as="span" fontWeight="500" ms="4px">
          <Link
            mx="3px"
            color={textColor}
            href="https://www.zeroxpoint.com"
            target="_blank"
            fontWeight="700"
          >
            {` | All Rights Reserved | Powered by ZEROXPOINT`}
          </Link>
        </Text>
      </Text>
      <List
        display="flex"
        flexDirection="column"
        textAlign={{ base: "center", lg: "start" }}
      >
        <ListItem
          mb="5px"
          me={{
            base: "20px",
            md: "44px",
          }}
        >
          <Link
            fontWeight="500"
            color={textColor}
            href="mailto:zeroxpoint766@gmail.com"
          >
            Email: zeroxpoint766@gmail.com
          </Link>
        </ListItem>
        <ListItem color={textColor} fontWeight="500" mb="5px">
          Contact Number: 63624 56719 / 91483 24230
        </ListItem>
        <ListItem color={textColor} fontWeight="500">
          Address: 2359/1, 10th Cross Rd, Milk Colony, 2nd Stage, Rajajinagar,
          Bengaluru, Karnataka 560055, India
        </ListItem>
      </List>
    </Flex>
  );
}
