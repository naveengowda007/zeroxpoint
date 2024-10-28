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
  let linkColor = useColorModeValue({ base: "gray.400", lg: "blue" }, "blue");

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
        px="40px"
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
          </Link>{" "}
          <br />
          {` | All Rights Reserved | Powered by ZEROXPOINT`}
        </Text>
        <List
          display="flex"
          flexDirection="column"
          textAlign={{ base: "center", lg: "start" }}
        >
          <ListItem>
            <Link
              fontWeight="500"
              color={linkColor}
              href="https://zerox-point-bucket.s3.us-east-1.amazonaws.com/Privacy+Policy.pdf"
              target="_blank"
            >
              Privacy Policy
            </Link>
          </ListItem>
          <ListItem>
            <Link
              fontWeight="500"
              color={linkColor}
              href="https://zerox-point-bucket.s3.us-east-1.amazonaws.com/Refund+And+Cancelation.pdf"
              target="_blank"
            >
              Refund and Cancellation Policy
            </Link>
          </ListItem>
          <ListItem>
            <Link
              fontWeight="500"
              color={linkColor}
              href="https://zerox-point-bucket.s3.us-east-1.amazonaws.com/terms+and+condtion.pdf"
              target="_blank"
            >
              Terms and Conditions
            </Link>
          </ListItem>
        </List>
      </Text>
      <List
        display="flex"
        flexDirection="column"
        textAlign={{ base: "center", lg: "start" }}
      >
        <ListItem
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
        <ListItem color={textColor} fontWeight="500">
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
