import React, { useState } from "react";
import {
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
} from "@chakra-ui/react";
import { SearchIcon, CloseIcon } from "@chakra-ui/icons";
export function SearchBar(props) {
  const { variant, background, children, placeholder, borderRadius, onChange, setSearchData, ...rest } = props;

  const [CurText, setCurText] = useState("")

  // Chakra Color Mode
  const searchIconColor = useColorModeValue("gray.700", "white");
  const inputBg = useColorModeValue("secondaryGray.300", "navy.900");
  const inputText = useColorModeValue("gray.700", "gray.100");
  return (
    <InputGroup w="100%" {...rest}>
      <InputLeftElement
        children={
          <IconButton
            bg='inherit'
            borderRadius='inherit'
            _hover='none'
            _active={{
              bg: "inherit",
              transform: "none",
              borderColor: "transparent",
            }}
            _focus={{
              boxShadow: "none",
            }}
            onClick={() => {
              setCurText("")
              setSearchData([])
            }}
            icon={CurText ? <CloseIcon color={searchIconColor} w='15px' h='15px' />
              :
              <SearchIcon color={searchIconColor} w='15px' h='15px' />
            }></IconButton>
        }
      />
      <Input
        variant='search'
        fontSize='sm'
        bg={background ? background : inputBg}
        color={inputText}
        fontWeight='500'
        _placeholder={{ color: "gray.400", fontSize: "14px" }}
        borderRadius={borderRadius ? borderRadius : "30px"}
        placeholder={placeholder ? placeholder : "Search..."}
        onChange={e => {
          let temp = e.target.value.trim()
          setCurText(temp)
          onChange(temp)
        }}
        onFocus={e => {
          let temp = e.target.value.trim()
          setCurText(temp)
          onChange(temp)
        }}
        value={CurText}
      />
    </InputGroup>
  );
}
